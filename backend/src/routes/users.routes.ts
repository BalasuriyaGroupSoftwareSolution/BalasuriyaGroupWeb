import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";

export const usersRouter = Router();

// Managing staff accounts (creating logins, fixing lockouts, deactivating
// people who've left) is an ADMIN/OWNER job — this is the "solve user login
// issues" feature from the brief.
const ADMIN_ROLES = ["ADMIN"] as const;

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
  requireRole(...ADMIN_ROLES),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
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
    "TOURISM_AGENT",
    "FINANCE_APPROVER",
    "TICKET_AGENT",
    "SOFTWARE_ENGINEER",
    "CHARTERED_ACCOUNTANT",
  ]),
});

usersRouter.post(
  "/",
  authenticate,
  requireRole(...ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const data = createStaffSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new HttpError(409, "A user with that email already exists.");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        role: data.role,
        passwordHash: await hashPassword(data.temporaryPassword),
      },
    });

    res.status(201).json({
      user: toSafeUser(user),
      note: "Share the temporary password with the staff member through a secure channel and ask them to change it after first login.",
    });
  })
);

const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  role: z
    .enum([
      "OWNER",
      "ADMIN",
      "CONSTRUCTION_MANAGER",
      "TOURISM_AGENT",
      "FINANCE_APPROVER",
      "TICKET_AGENT",
      "SOFTWARE_ENGINEER",
      "CHARTERED_ACCOUNTANT",
      "CUSTOMER",
    ])
    .optional(),
});

usersRouter.patch(
  "/:id",
  authenticate,
  requireRole(...ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ user: toSafeUser(user) });
  })
);

usersRouter.delete(
  "/:id",
  authenticate,
  requireRole(...ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    if (req.user?.id === req.params.id) {
      throw new HttpError(400, "You cannot delete your own active account.");
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User account removed permanently." });
  })
);

const resetPasswordSchema = z.object({ temporaryPassword: z.string().min(8) });

usersRouter.post(
  "/:id/reset-password",
  authenticate,
  requireRole(...ADMIN_ROLES),
  asyncHandler(async (req, res) => {
    const { temporaryPassword } = resetPasswordSchema.parse(req.body);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash: await hashPassword(temporaryPassword) },
    });
    res.json({ message: "Password reset. Share the new temporary password securely." });
  })
);
