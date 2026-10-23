import { Router } from "express";
import { z } from "zod";
import { Prisma, type Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, userRoles, type AuthedUser } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";
import { sendStaffWelcomeEmail } from "../utils/mailer.js";
import { toPublicUser } from "./auth.routes.js";

export const usersRouter = Router();

const ALL_ROLES = [
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
] as const satisfies readonly Role[];

/** Which roles each division leader may create / edit / reset / remove. */
export const DIVISION_ROLES_MAP: Partial<Record<Role, Role[]>> = {
  CONSTRUCTION_MANAGER: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF"],
  TOURISM_AGENT: ["TOURISM_AGENT", "TOURISM_STAFF"],
  SOFTWARE_ENGINEER: ["SOFTWARE_ENGINEER", "SOFTWARE_STAFF"],
  TICKET_AGENT: ["TICKET_AGENT", "TICKET_STAFF"],
  FINANCE_APPROVER: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
  CHARTERED_ACCOUNTANT: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
};

const isOwner = (u: AuthedUser) => userRoles(u).includes("OWNER");
const isExecutive = (u: AuthedUser) => isOwner(u) || userRoles(u).includes("ADMIN");

function manageableRoles(caller: AuthedUser): Set<string> {
  if (isOwner(caller)) return new Set(ALL_ROLES);
  // ADMIN manages everyone except OWNER, and cannot create other ADMINs.
  if (isExecutive(caller)) return new Set(ALL_ROLES.filter((r) => r !== "OWNER" && r !== "ADMIN"));
  return new Set(userRoles(caller).flatMap((r) => DIVISION_ROLES_MAP[r as Role] ?? []));
}

/** Caller may act on a user whose primary AND secondary roles are all within reach. */
function canManage(caller: AuthedUser, target: { role: string; secondaryRoles?: string[] }) {
  const allowed = manageableRoles(caller);
  return [target.role, ...(target.secondaryRoles ?? [])].every((r) => allowed.has(r));
}

function requireStaffManager(caller: AuthedUser) {
  if (manageableRoles(caller).size === 0) {
    throw new HttpError(403, "You don't have permission to manage staff.");
  }
}

/** Accepts either a database id or an email in the :id route param. */
async function findTarget(idOrEmail: string) {
  const key = decodeURIComponent(idOrEmail).trim();
  const user = key.includes("@")
    ? await prisma.user.findUnique({ where: { email: key.toLowerCase() } })
    : await prisma.user.findUnique({ where: { id: key } });
  if (!user) throw new HttpError(404, "User not found.");
  return user;
}

const roleEnum = z.enum(ALL_ROLES);
const staffFields = {
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().trim().max(25).optional().nullable(),
  department: z.string().trim().max(120).optional().nullable(),
  jobTitle: z.string().trim().max(160).optional().nullable(),
  secondaryRoles: z.array(roleEnum).max(10).optional(),
  assignedDivisions: z.array(z.string().trim().max(120)).max(10).optional(),
};

usersRouter.use(authenticate);

// List staff (executives see everyone; division leaders see their divisions).
usersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const caller = req.user!;
    requireStaffManager(caller);

    const includeCustomers = req.query.includeCustomers === "true" && isExecutive(caller);
    const allowed = [...manageableRoles(caller)] as Role[];

    const users = await prisma.user.findMany({
      where: isExecutive(caller)
        ? includeCustomers
          ? undefined
          : { role: { not: "CUSTOMER" } }
        : { OR: [{ role: { in: allowed.filter((r) => r !== "CUSTOMER") } }, { id: caller.id }] },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
    res.json({ users: users.map(toPublicUser) });
  })
);

const createStaffSchema = z.object({
  ...staffFields,
  role: roleEnum.refine((r) => r !== "CUSTOMER", "Choose a staff role."),
  temporaryPassword: z.string().min(8).max(200),
});

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const caller = req.user!;
    requireStaffManager(caller);
    const data = createStaffSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();
    const secondaryRoles = (data.secondaryRoles ?? []).filter((r) => r !== data.role);

    if (!canManage(caller, { role: data.role, secondaryRoles })) {
      throw new HttpError(403, "You can only add staff within your own divisions.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role !== "CUSTOMER") {
      throw new HttpError(409, "A staff account with that email already exists.");
    }

    const fields = {
      name: data.name,
      phone: data.phone || null,
      role: data.role,
      secondaryRoles,
      department: data.department || null,
      jobTitle: data.jobTitle || null,
      assignedDivisions: data.assignedDivisions ?? (data.department ? [data.department] : []),
      passwordHash: await hashPassword(data.temporaryPassword),
      isActive: true,
    };

    let user;
    try {
      user = existing
        ? // Promote an existing customer account (keeps their bookings).
          await prisma.user.update({ where: { id: existing.id }, data: fields })
        : await prisma.user.create({ data: { ...fields, email } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new HttpError(409, "That email or phone number is already used by another account.");
      }
      throw err;
    }

    const mail = await sendStaffWelcomeEmail({
      name: user.name,
      email: user.email,
      role: user.role,
      temporaryPassword: data.temporaryPassword,
    });

    res.status(201).json({
      user: toPublicUser(user),
      emailDispatched: mail.success,
      note: mail.success
        ? `Welcome email with the temporary password sent to ${user.email}.`
        : "Email isn't configured — share the temporary password with them privately.",
    });
  })
);

const updateUserSchema = z
  .object({
    ...staffFields,
    role: roleEnum,
    isActive: z.boolean(),
  })
  .partial();

usersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const caller = req.user!;
    requireStaffManager(caller);
    const target = await findTarget(req.params.id);
    const data = updateUserSchema.parse(req.body);

    if (!canManage(caller, target)) {
      throw new HttpError(403, "You can only manage staff within your own divisions.");
    }

    const nextRole = data.role ?? target.role;
    const nextSecondary = (data.secondaryRoles ?? target.secondaryRoles).filter((r) => r !== nextRole);
    if (!canManage(caller, { role: nextRole, secondaryRoles: nextSecondary })) {
      throw new HttpError(403, "You can't assign a role outside your own divisions.");
    }

    if (target.id === caller.id && (data.isActive === false || (data.role && data.role !== target.role))) {
      throw new HttpError(400, "You can't suspend yourself or change your own role.");
    }

    // Never leave the company without an active owner.
    if (target.role === "OWNER" && (nextRole !== "OWNER" || data.isActive === false)) {
      const otherOwners = await prisma.user.count({
        where: { role: "OWNER", isActive: true, NOT: { id: target.id } },
      });
      if (otherOwners === 0) throw new HttpError(400, "There must always be at least one active owner.");
    }

    let user;
    try {
      user = await prisma.user.update({
        where: { id: target.id },
        data: {
          name: data.name,
          email: data.email ? data.email.toLowerCase().trim() : undefined,
          phone: data.phone === undefined ? undefined : data.phone || null,
          role: data.role,
          secondaryRoles: (data.secondaryRoles || data.role) ? nextSecondary : undefined,
          department: data.department === undefined ? undefined : data.department || null,
          jobTitle: data.jobTitle === undefined ? undefined : data.jobTitle || null,
          assignedDivisions: data.assignedDivisions,
          isActive: data.isActive,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new HttpError(409, "That email or phone number is already used by another account.");
      }
      throw err;
    }

    res.json({ user: toPublicUser(user), message: "Staff details saved." });
  })
);

usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const caller = req.user!;
    requireStaffManager(caller);
    const target = await findTarget(req.params.id);

    if (target.id === caller.id) throw new HttpError(400, "You can't remove your own account.");
    if (target.role === "OWNER") throw new HttpError(403, "Owner accounts can't be removed.");
    if (!canManage(caller, target)) throw new HttpError(403, "You can only remove staff within your own divisions.");

    try {
      await prisma.user.delete({ where: { id: target.id } });
      res.json({ message: "Account removed.", removed: true });
    } catch (err) {
      // They created projects/packages/approvals — keep history, just block access.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        await prisma.user.update({ where: { id: target.id }, data: { isActive: false } });
        return res.json({
          message: "This person has records linked to their account, so it was suspended instead of deleted.",
          removed: false,
          suspended: true,
        });
      }
      throw err;
    }
  })
);

const resetPasswordSchema = z.object({ temporaryPassword: z.string().min(8).max(200) });

usersRouter.post(
  "/:id/reset-password",
  asyncHandler(async (req, res) => {
    const caller = req.user!;
    requireStaffManager(caller);
    const target = await findTarget(req.params.id);
    if (!canManage(caller, target)) throw new HttpError(403, "You can only reset passwords for staff in your divisions.");

    const { temporaryPassword } = resetPasswordSchema.parse(req.body);
    await prisma.user.update({ where: { id: target.id }, data: { passwordHash: await hashPassword(temporaryPassword) } });

    const mail = await sendStaffWelcomeEmail({
      name: target.name,
      email: target.email,
      role: target.role,
      temporaryPassword,
      isReset: true,
    });

    res.json({
      message: mail.success
        ? `Password reset and emailed to ${target.email}.`
        : "Password reset. Email isn't configured — share the new temporary password privately.",
      emailDispatched: mail.success,
    });
  })
);
