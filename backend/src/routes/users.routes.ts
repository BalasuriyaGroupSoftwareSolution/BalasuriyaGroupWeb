import { Router } from "express";
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

export function canManageRole(callerRole: string | undefined, targetRole: string): boolean {
  if (callerRole === "OWNER" || callerRole === "ADMIN") return true;
  if (!callerRole) return false;
  const allowed = DIVISION_ROLES_MAP[callerRole];
  return !!allowed && allowed.includes(targetRole);
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
    const isExecutive = callerRole === "OWNER" || callerRole === "ADMIN";
    const allowed = callerRole && DIVISION_ROLES_MAP[callerRole];

    // Executive sees all users; Division Leader sees themselves and their division's section staff
    const whereClause = isExecutive
      ? undefined
      : {
          OR: [
            ...(allowed ? [{ role: { in: allowed as any } }] : []),
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
    const callerRole = req.user?.role;
    const data = createStaffSchema.parse(req.body);

    // Division leaders can only add staff within their division's roles
    if (!canManageRole(callerRole, data.role)) {
      throw new HttpError(403, `You can only add staff within your own division.`);
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new HttpError(409, "A user with that email already exists.");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        role: data.role as any,
        passwordHash: await hashPassword(data.temporaryPassword),
      },
    });

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
    const callerRole = req.user?.role;
    const data = updateUserSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new HttpError(404, "User not found.");

    // Division leaders can only modify staff in their own division
    if (!canManageRole(callerRole, targetUser.role)) {
      throw new HttpError(403, "You can only manage staff within your own division.");
    }

    if (data.role && !canManageRole(callerRole, data.role)) {
      throw new HttpError(403, "You cannot assign a role outside of your division.");
    }

    if (data.email && data.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existing) throw new HttpError(409, "A user with that email already exists.");
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...data,
        role: data.role ? (data.role as any) : undefined,
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
    if (req.user?.id === req.params.id) {
      throw new HttpError(400, "You cannot delete your own active account.");
    }
    const callerRole = req.user?.role;

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new HttpError(404, "User not found.");

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

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new HttpError(404, "User not found.");

    if (!canManageRole(callerRole, targetUser.role)) {
      throw new HttpError(403, "You can only reset passwords for staff in your division.");
    }

    const { temporaryPassword } = resetPasswordSchema.parse(req.body);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash: await hashPassword(temporaryPassword) },
    });

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
