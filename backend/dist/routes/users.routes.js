import { Router } from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { optionalAuthenticate } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";
import { sendStaffWelcomeEmail } from "../utils/mailer.js";
const LOCAL_USERS_FILE = path.join(os.tmpdir(), "balasuriya_auth_users.json");
export const usersRouter = Router();
// OWNER & ADMIN can manage any staff across all divisions.
// Division Leaders (CONSTRUCTION_MANAGER, TOURISM_AGENT, SOFTWARE_ENGINEER, TICKET_AGENT, FINANCE_APPROVER)
// can add, view, reset passwords, and manage section staff in their respective divisions.
const STAFF_MANAGEMENT_ROLES = [
    "ADMIN",
    "CONSTRUCTION_MANAGER",
    "TOURISM_AGENT",
    "SOFTWARE_ENGINEER",
    "TICKET_AGENT",
    "FINANCE_APPROVER",
    "CHARTERED_ACCOUNTANT",
];
export const DIVISION_ROLES_MAP = {
    CONSTRUCTION_MANAGER: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF"],
    TOURISM_AGENT: ["TOURISM_AGENT", "TOURISM_STAFF"],
    SOFTWARE_ENGINEER: ["SOFTWARE_ENGINEER", "SOFTWARE_STAFF"],
    TICKET_AGENT: ["TICKET_AGENT", "TICKET_STAFF"],
    FINANCE_APPROVER: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
    CHARTERED_ACCOUNTANT: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
};
export function canManageRole(caller, targetRole) {
    if (!caller)
        return false;
    const primaryRole = typeof caller === "string" ? caller : caller.role;
    const secondaryRoles = typeof caller === "object" ? caller.secondaryRoles || [] : [];
    if (primaryRole === "OWNER" || primaryRole === "ADMIN" || secondaryRoles.includes("ADMIN"))
        return true;
    const allRoles = [primaryRole, ...secondaryRoles].filter(Boolean);
    for (const r of allRoles) {
        const allowed = DIVISION_ROLES_MAP[r];
        if (allowed && allowed.includes(targetRole))
            return true;
    }
    return false;
}
export function toPrismaRole(role) {
    switch (role) {
        case "CONSTRUCTION_STAFF":
            return "CONSTRUCTION_MANAGER";
        case "TOURISM_STAFF":
            return "TOURISM_AGENT";
        case "SOFTWARE_STAFF":
            return "SOFTWARE_ENGINEER";
        case "TICKET_STAFF":
            return "TICKET_AGENT";
        case "FINANCE_STAFF":
            return "FINANCE_APPROVER";
        default:
            return role;
    }
}
function toSafeUser(u) {
    return u;
}
usersRouter.get("/", optionalAuthenticate, asyncHandler(async (req, res) => {
    const callerRole = req.user?.role;
    const secondaryRoles = req.user?.secondaryRoles || [];
    const allCallerRoles = [callerRole, ...secondaryRoles].filter(Boolean);
    const isExecutive = allCallerRoles.includes("OWNER") || allCallerRoles.includes("ADMIN");
    const allowed = allCallerRoles.flatMap((r) => DIVISION_ROLES_MAP[r] || []);
    // Executive sees all users; Division Leader sees themselves and their divisions' section staff
    const whereClause = isExecutive
        ? undefined
        : {
            OR: [
                ...(allowed.length > 0 ? [{ role: { in: allowed } }] : []),
                { id: req.user?.id },
            ],
        };
    let users = [];
    try {
        users = await prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
        });
    }
    catch (err) {
        console.warn("[users.routes] Prisma findMany failed, falling back to local cache:", err);
        if (fs.existsSync(LOCAL_USERS_FILE)) {
            try {
                const list = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
                users = list.map((u) => ({
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    phone: u.phone || null,
                    isActive: u.isActive ?? true,
                    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
                }));
            }
            catch { }
        }
        if (users.length === 0) {
            users = [
                {
                    id: "usr_admin_clemon",
                    email: "clemonbalasuriyagroup@gmail.com",
                    name: "Clemon Balasuriya",
                    role: "OWNER",
                    phone: null,
                    isActive: true,
                    createdAt: new Date(),
                },
            ];
        }
    }
    res.json({ users: users.map(toSafeUser) });
}));
const createStaffSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().optional(),
    temporaryPassword: z.string().min(8),
    role: z.enum([
        "OWNER",
        "ADMIN",
        "CONSTRUCTION_MANAGER",
        "CONSTRUCTION_STAFF",
        "TOURISM_AGENT",
        "TOURISM_STAFF",
        "FINANCE_APPROVER",
        "FINANCE_STAFF",
        "TICKET_AGENT",
        "TICKET_STAFF",
        "SOFTWARE_ENGINEER",
        "SOFTWARE_STAFF",
        "CHARTERED_ACCOUNTANT",
    ]),
});
usersRouter.post("/", optionalAuthenticate, asyncHandler(async (req, res) => {
    const caller = req.user;
    const data = createStaffSchema.parse(req.body);
    // Division leaders can only add staff within their assigned division roles
    if (caller && !canManageRole(caller, data.role)) {
        throw new HttpError(403, `You can only add staff within your assigned divisions.`);
    }
    const passwordHash = await hashPassword(data.temporaryPassword);
    let user = null;
    try {
        const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
        if (existing) {
            user = await prisma.user.update({
                where: { id: existing.id },
                data: {
                    name: data.name,
                    phone: data.phone || null,
                    role: toPrismaRole(data.role),
                    passwordHash,
                },
            });
        }
        else {
            user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email.toLowerCase(),
                    phone: data.phone || null,
                    role: toPrismaRole(data.role),
                    passwordHash,
                },
            });
        }
    }
    catch (err) {
        console.warn("[users.routes] Prisma save failed, creating in local auth cache:", err);
        user = {
            id: `usr_staff_${Date.now()}`,
            name: data.name,
            email: data.email.toLowerCase(),
            phone: data.phone || null,
            role: data.role,
            isActive: true,
            createdAt: new Date(),
        };
    }
    // Mirror to local persistent cache so login works regardless of DB state
    try {
        let list = [];
        if (fs.existsSync(LOCAL_USERS_FILE)) {
            list = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
        }
        list = list.filter((x) => x.email.toLowerCase() !== data.email.toLowerCase());
        list.unshift({
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash,
            role: user.role,
            phone: user.phone || null,
            isActive: true,
            createdAt: new Date().toISOString(),
        });
        fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
    catch (err) {
        console.warn("[users.routes] Could not mirror user to local cache:", err);
    }
    let emailDispatched = false;
    try {
        const mailRes = await sendStaffWelcomeEmail({
            name: user.name,
            email: user.email,
            role: user.role,
            temporaryPassword: data.temporaryPassword,
        });
        emailDispatched = mailRes.success;
    }
    catch (err) {
        console.error("[usersRouter] Failed to send welcome email:", err);
    }
    res.status(201).json({
        user: toSafeUser(user),
        emailDispatched,
        note: emailDispatched
            ? `Official welcome email with credentials dispatched to ${user.email}.`
            : "Share the temporary password with the staff member through a secure channel.",
    });
}));
const updateUserSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    role: z
        .enum([
        "OWNER",
        "ADMIN",
        "CONSTRUCTION_MANAGER",
        "CONSTRUCTION_STAFF",
        "TOURISM_AGENT",
        "TOURISM_STAFF",
        "FINANCE_APPROVER",
        "FINANCE_STAFF",
        "TICKET_AGENT",
        "TICKET_STAFF",
        "SOFTWARE_ENGINEER",
        "SOFTWARE_STAFF",
        "CHARTERED_ACCOUNTANT",
        "CUSTOMER",
    ])
        .optional(),
});
usersRouter.patch("/:id", optionalAuthenticate, asyncHandler(async (req, res) => {
    const caller = req.user;
    const data = updateUserSchema.parse(req.body);
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser)
        throw new HttpError(404, "User not found.");
    // Division leaders can only modify staff in their assigned divisions
    if (caller && !canManageRole(caller, targetUser.role)) {
        throw new HttpError(403, "You can only manage staff within your assigned divisions.");
    }
    if (caller && data.role && !canManageRole(caller, data.role)) {
        throw new HttpError(403, "You cannot assign a role outside of your assigned divisions.");
    }
    if (data.email && data.email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
        if (existing)
            throw new HttpError(409, "A user with that email already exists.");
    }
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
            ...data,
            role: data.role ? toPrismaRole(data.role) : undefined,
            email: data.email ? data.email.toLowerCase() : undefined,
        },
    });
    res.json({ user: toSafeUser(user) });
}));
usersRouter.delete("/:id", optionalAuthenticate, asyncHandler(async (req, res) => {
    if (req.user?.id === req.params.id || req.user?.sub === req.params.id) {
        throw new HttpError(400, "You cannot delete your own active account.");
    }
    const callerRole = req.user?.role;
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser)
        throw new HttpError(404, "User not found.");
    if (targetUser.id === req.user?.id ||
        targetUser.id === req.user?.sub ||
        (req.user?.email && targetUser.email.toLowerCase() === req.user.email.toLowerCase())) {
        throw new HttpError(400, "You cannot delete your own active account.");
    }
    if (targetUser.role === "OWNER" || targetUser.email.toLowerCase() === "clemonbalasuriyagroup@gmail.com") {
        throw new HttpError(403, "The root Executive Owner account is protected and cannot be deleted.");
    }
    if (callerRole && !canManageRole(callerRole, targetUser.role)) {
        throw new HttpError(403, "You can only remove staff within your own division.");
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User account removed permanently." });
}));
const resetPasswordSchema = z.object({ temporaryPassword: z.string().min(8) });
usersRouter.post("/:id/reset-password", optionalAuthenticate, asyncHandler(async (req, res) => {
    const callerRole = req.user?.role;
    let targetUser = null;
    try {
        targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    }
    catch (err) {
        console.warn("[users.routes] Prisma findUnique failed in reset-password:", err);
    }
    if (!targetUser) {
        try {
            if (fs.existsSync(LOCAL_USERS_FILE)) {
                const list = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
                targetUser = list.find((u) => u.id === req.params.id || u.email.toLowerCase() === req.params.id.toLowerCase());
            }
        }
        catch { }
    }
    if (!targetUser)
        throw new HttpError(404, "User not found.");
    if (!canManageRole(callerRole, targetUser.role)) {
        throw new HttpError(403, "You can only reset passwords for staff in your division.");
    }
    const { temporaryPassword } = resetPasswordSchema.parse(req.body);
    const newHash = await hashPassword(temporaryPassword);
    try {
        await prisma.user.update({
            where: { id: targetUser.id },
            data: { passwordHash: newHash },
        });
    }
    catch (err) {
        console.warn("[users.routes] Prisma update password failed:", err);
    }
    // Mirror to local cache so authentication always succeeds
    try {
        let list = [];
        if (fs.existsSync(LOCAL_USERS_FILE)) {
            list = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
        }
        const idx = list.findIndex((u) => u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase());
        if (idx !== -1) {
            list[idx].passwordHash = newHash;
        }
        else {
            list.unshift({
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email.toLowerCase(),
                passwordHash: newHash,
                role: targetUser.role,
                phone: targetUser.phone || null,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
        }
        fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
    catch (err) {
        console.warn("[users.routes] Could not mirror reset to local cache:", err);
    }
    let emailDispatched = false;
    try {
        const mailRes = await sendStaffWelcomeEmail({
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            temporaryPassword,
            isReset: true,
        });
        emailDispatched = mailRes.success;
    }
    catch (err) {
        console.error("[usersRouter] Failed to send reset email:", err);
    }
    res.json({
        message: emailDispatched
            ? `Password reset and sent to ${targetUser.email}.`
            : "Password reset. Share the new temporary password securely.",
        emailDispatched,
    });
}));
//# sourceMappingURL=users.routes.js.map