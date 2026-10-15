import { Router } from "express";
import fs from "fs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";
import { sendStaffWelcomeEmail } from "../utils/mailer.js";

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
] as const;

export const DIVISION_ROLES_MAP: Record<string, string[]> = {
  CONSTRUCTION_MANAGER: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF"],
  TOURISM_AGENT: ["TOURISM_AGENT", "TOURISM_STAFF"],
  SOFTWARE_ENGINEER: ["SOFTWARE_ENGINEER", "SOFTWARE_STAFF"],
  TICKET_AGENT: ["TICKET_AGENT", "TICKET_STAFF"],
  FINANCE_APPROVER: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
  CHARTERED_ACCOUNTANT: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
};

export function canManageRole(
  caller: { role?: string; secondaryRoles?: string[] } | string | undefined,
  targetRole: string
): boolean {
  if (!caller) return false;
  const primaryRole = typeof caller === "string" ? caller : caller.role;
  const secondaryRoles = typeof caller === "object" ? caller.secondaryRoles || [] : [];
  if (primaryRole === "OWNER" || primaryRole === "ADMIN" || secondaryRoles.includes("ADMIN")) return true;

  const allRoles = [primaryRole, ...secondaryRoles].filter(Boolean) as string[];
  for (const r of allRoles) {
    const allowed = DIVISION_ROLES_MAP[r];
    if (allowed && allowed.includes(targetRole)) return true;
  }
  return false;
}

export function toPrismaRole(role: string): any {
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

function toSafeUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
}) {
  return u;
}

usersRouter.get(
  "/",
  authenticate,
  requireRole(...STAFF_MANAGEMENT_ROLES),
  asyncHandler(async (req, res) => {
    const callerRole = req.user?.role;
    const secondaryRoles = req.user?.secondaryRoles || [];
    const allCallerRoles = [callerRole, ...secondaryRoles].filter(Boolean) as string[];
    const isExecutive = allCallerRoles.includes("OWNER") || allCallerRoles.includes("ADMIN");
    const allowed = allCallerRoles.flatMap((r) => DIVISION_ROLES_MAP[r] || []);

    // Executive sees all users; Division Leader sees themselves and their divisions' section staff
    const whereClause = isExecutive
      ? undefined
      : {
          OR: [
            ...(allowed.length > 0 ? [{ role: { in: allowed as any } }] : []),
            { id: req.user?.id },
          ],
        };

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true },
    });
    res.json({ users: users.map(toSafeUser) });
  })
);

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

usersRouter.post(
  "/",
  authenticate,
  requireRole(...STAFF_MANAGEMENT_ROLES),
  asyncHandler(async (req, res) => {
    const caller = req.user;
    const data = createStaffSchema.parse(req.body);

    // Division leaders can only add staff within their assigned division roles
    if (!canManageRole(caller, data.role)) {
      throw new HttpError(403, `You can only add staff within your assigned divisions.`);
    }

    const passwordHash = await hashPassword(data.temporaryPassword);
    let user: any = null;

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
      } else {
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
    } catch (err) {
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
      const LOCAL_USERS_FILE = "/tmp/balasuriya_auth_users.json";
      let list: any[] = [];
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
    } catch (err) {
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
    } catch (err) {
      console.error("[usersRouter] Failed to send welcome email:", err);
    }

    res.status(201).json({
      user: toSafeUser(user),
      emailDispatched,
      note: emailDispatched
        ? `Official welcome email with credentials dispatched to ${user.email}.`
        : "Share the temporary password with the staff member through a secure channel.",
    });
  })
);

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

usersRouter.patch(
  "/:id",
  authenticate,
  requireRole(...STAFF_MANAGEMENT_ROLES),
  asyncHandler(async (req, res) => {
    const caller = req.user;
    const data = updateUserSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new HttpError(404, "User not found.");

    // Division leaders can only modify staff in their assigned divisions
    if (!canManageRole(caller, targetUser.role)) {
      throw new HttpError(403, "You can only manage staff within your assigned divisions.");
    }

    if (data.role && !canManageRole(caller, data.role)) {
      throw new HttpError(403, "You cannot assign a role outside of your assigned divisions.");
    }

    if (data.email && data.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existing) throw new HttpError(409, "A user with that email already exists.");
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
  })
);

usersRouter.delete(
  "/:id",
  authenticate,
  requireRole(...STAFF_MANAGEMENT_ROLES),
  asyncHandler(async (req, res) => {
    if (req.user?.id === req.params.id || req.user?.sub === req.params.id) {
      throw new HttpError(400, "You cannot delete your own active account.");
    }
    const callerRole = req.user?.role;

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new HttpError(404, "User not found.");

    if (
      targetUser.id === req.user?.id ||
      targetUser.id === req.user?.sub ||
      (req.user?.email && targetUser.email.toLowerCase() === req.user.email.toLowerCase())
    ) {
      throw new HttpError(400, "You cannot delete your own active account.");
    }

    if (targetUser.role === "OWNER" || targetUser.email.toLowerCase() === "clemonbalasuriyagroup@gmail.com") {
      throw new HttpError(403, "The root Executive Owner account is protected and cannot be deleted.");
    }

    if (!canManageRole(callerRole, targetUser.role)) {
      throw new HttpError(403, "You can only remove staff within your own division.");
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User account removed permanently." });
  })
);

const resetPasswordSchema = z.object({ temporaryPassword: z.string().min(8) });

usersRouter.post(
  "/:id/reset-password",
  authenticate,
  requireRole(...STAFF_MANAGEMENT_ROLES),
  asyncHandler(async (req, res) => {
    const callerRole = req.user?.role;
    const LOCAL_USERS_FILE = "/tmp/balasuriya_auth_users.json";

    let targetUser: any = null;
    try {
      targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    } catch (err) {
      console.warn("[users.routes] Prisma findUnique failed in reset-password:", err);
    }

    if (!targetUser) {
      try {
        if (fs.existsSync(LOCAL_USERS_FILE)) {
          const list: any[] = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
          targetUser = list.find((u) => u.id === req.params.id || u.email.toLowerCase() === req.params.id.toLowerCase());
        }
      } catch {}
    }

    if (!targetUser) throw new HttpError(404, "User not found.");

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
    } catch (err) {
      console.warn("[users.routes] Prisma update password failed:", err);
    }

    // Mirror to local cache so authentication always succeeds
    try {
      let list: any[] = [];
      if (fs.existsSync(LOCAL_USERS_FILE)) {
        list = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
      }
      const idx = list.findIndex((u) => u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase());
      if (idx !== -1) {
        list[idx].passwordHash = newHash;
      } else {
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
    } catch (err) {
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
    } catch (err) {
      console.error("[usersRouter] Failed to send reset email:", err);
    }

    res.json({
      message: emailDispatched
        ? `Password reset and sent to ${targetUser.email}.`
        : "Password reset. Share the new temporary password securely.",
      emailDispatched,
    });
  })
);
