import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/jwt.js";
import { createVerificationCode, consumeVerificationCode } from "../utils/otp.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

/** The only user shape ever sent to the browser — never includes passwordHash. */
export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  department?: string | null;
  jobTitle?: string | null;
  secondaryRoles?: string[];
  assignedDivisions?: string[];
  isActive?: boolean;
  createdAt?: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    department: user.department ?? null,
    jobTitle: user.jobTitle ?? null,
    secondaryRoles: user.secondaryRoles ?? [],
    assignedDivisions: user.assignedDivisions ?? [],
    isActive: user.isActive ?? true,
    createdAt: user.createdAt,
  };
}

const INVALID_LOGIN = "Invalid email or password.";
// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.qq1tQ5P0xPQY0x8F6sKZ3l8JQO2K";

const normEmail = (e: string) => e.toLowerCase().trim();

// ---------- Register (always creates a CUSTOMER) ----------
const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  phone: z.string().trim().min(7).max(20).optional(),
});

authRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = normEmail(data.email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, "An account with that email already exists. Try signing in or resetting your password.");
    }
    if (data.phone) {
      const phoneTaken = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (phoneTaken) throw new HttpError(409, "That phone number is already linked to another account.");
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        phone: data.phone || null,
        passwordHash: await hashPassword(data.password),
        role: "CUSTOMER",
      },
    });

    res.status(201).json({ token: signAuthToken(user), user: toPublicUser(user) });
  })
);

// ---------- Password login ----------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: normEmail(email) } });

    const valid = await verifyPassword(password, user?.passwordHash || DUMMY_HASH).catch(() => false);
    if (!user || !user.passwordHash || !valid) {
      throw new HttpError(401, INVALID_LOGIN);
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been suspended. Please contact the administrator.");
    }

    res.json({ token: signAuthToken(user), user: toPublicUser(user) });
  })
);

// ---------- Email one-time-code login ----------
const sendCodeSchema = z.object({ identifier: z.string().email("Enter a valid email address.") });

authRouter.post(
  "/otp/send",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { identifier } = sendCodeSchema.parse(req.body);
    await createVerificationCode(normEmail(identifier));
    res.json({ message: "If that email can receive mail, a 6-digit code is on its way." });
  })
);

const verifyCodeSchema = z.object({
  identifier: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

authRouter.post(
  "/otp/verify",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { identifier, code } = verifyCodeSchema.parse(req.body);
    const email = normEmail(identifier);

    if (!(await consumeVerificationCode(email, code))) {
      throw new HttpError(400, "Invalid or expired verification code.");
    }

    // Proving control of the inbox is enough to sign in, or to create a customer account.
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name: email.split("@")[0], role: "CUSTOMER" } });
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been suspended. Please contact the administrator.");
    }

    res.json({ token: signAuthToken(user), user: toPublicUser(user) });
  })
);

// ---------- Google sign-in (verified ID token only) ----------
const googleLoginSchema = z.object({ idToken: z.string().min(20) });

authRouter.post(
  "/google",
  authLimiter,
  asyncHandler(async (req, res) => {
    if (!env.google.clientId) {
      throw new HttpError(503, "Google sign-in is not configured on this site.");
    }
    const { idToken } = googleLoginSchema.parse(req.body);

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!verifyRes.ok) throw new HttpError(401, "Google sign-in could not be verified.");
    const info = (await verifyRes.json()) as { aud?: string; email?: string; email_verified?: string | boolean; name?: string; iss?: string };

    const issuerOk = info.iss === "accounts.google.com" || info.iss === "https://accounts.google.com";
    const verified = info.email_verified === true || info.email_verified === "true";
    if (info.aud !== env.google.clientId || !issuerOk || !verified || !info.email) {
      throw new HttpError(401, "Google sign-in could not be verified.");
    }

    const email = normEmail(info.email);
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: info.name || email.split("@")[0], role: "CUSTOMER" },
      });
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been suspended. Please contact the administrator.");
    }

    res.json({ token: signAuthToken(user), user: toPublicUser(user) });
  })
);

// ---------- Current user ----------
authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(401, "Please sign in again.");
    res.json({ user: toPublicUser(user) });
  })
);

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(7).max(25).optional(),
});

authRouter.patch(
  "/profile",
  authenticate,
  asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);
    if (data.phone) {
      const taken = await prisma.user.findFirst({ where: { phone: data.phone, NOT: { id: req.user!.id } } });
      if (taken) throw new HttpError(409, "That phone number is already linked to another account.");
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: data.name, phone: data.phone },
    });
    res.json({ user: toPublicUser(user), message: "Profile updated successfully." });
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().max(200).optional().default(""),
  newPassword: z.string().min(8, "New password must be at least 8 characters.").max(200),
});

authRouter.post(
  "/change-password",
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(401, "Please sign in again.");

    // Accounts created by Google / email-code login have no password yet; they may set one.
    if (user.passwordHash) {
      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) throw new HttpError(401, "Current password is incorrect.");
    }

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
    res.json({ message: "Password updated successfully." });
  })
);

// ---------- Forgot / reset password ----------
// The reset token is an HMAC over (email, expiry, current password hash). It is
// only ever delivered by email, and it stops working as soon as the password
// changes, so each link can be used once.
function resetSignature(email: string, expiry: number, passwordHash: string | null) {
  return crypto
    .createHmac("sha256", env.jwtSecret)
    .update(`reset:${email}:${expiry}:${passwordHash ?? ""}`)
    .digest("hex");
}

const forgotPasswordSchema = z.object({ email: z.string().email() });

authRouter.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = normEmail(forgotPasswordSchema.parse(req.body).email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isActive) {
      const expiry = Date.now() + 30 * 60 * 1000;
      const token = `${expiry}.${resetSignature(email, expiry, user.passwordHash)}`;
      const resetUrl = `${env.siteUrl}/forgot-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, user.name, resetUrl).catch((err) =>
        console.error("[forgot-password] email failed:", err)
      );
    }

    // Same answer whether or not the account exists.
    res.json({ message: `If an account exists for ${email}, a reset link has been sent. Please check your inbox and spam folder.` });
  })
);

const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(10).max(200),
  newPassword: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

authRouter.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = resetPasswordSchema.parse(req.body);
    const email = normEmail(data.email);
    const invalid = new HttpError(400, "This reset link is invalid or has expired. Please request a new one.");

    const [expiryStr, sig] = data.resetToken.split(".");
    const expiry = Number(expiryStr);
    if (!sig || !Number.isFinite(expiry) || Date.now() > expiry) throw invalid;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw invalid;

    const expected = resetSignature(email, expiry, user.passwordHash);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      throw invalid;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(data.newPassword) },
    });
    res.json({ token: signAuthToken(updated), user: toPublicUser(updated), message: "Password successfully reset." });
  })
);
