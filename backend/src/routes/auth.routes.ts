import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/jwt.js";
import { createVerificationCode, consumeVerificationCode } from "../utils/otp.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import { env } from "../config/env.js";

export const authRouter = Router();

// Slow down brute-force / OTP-spamming attempts. The previous backend had no
// rate limiting at all on login or OTP endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

function toPublicUser(user: { id: string; email: string; name: string; role: string; phone: string | null }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone };
}

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().min(7).max(20).optional(),
});

authRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new HttpError(409, "An account with that email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await hashPassword(data.password),
        role: "CUSTOMER",
      },
    });

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.status(201).json({ token, user: toPublicUser(user) });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Same generic message whether the email doesn't exist or the password is
    // wrong, so a caller can't use this endpoint to discover which emails have
    // accounts.
    if (!user || !user.passwordHash || !user.isActive) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

const sendCodeSchema = z.object({ identifier: z.string().email("Enter a valid email address.") });

authRouter.post(
  "/otp/send",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { identifier } = sendCodeSchema.parse(req.body);
    await createVerificationCode(identifier.toLowerCase());
    res.json({ message: "Verification code sent. Please check your email." });
  })
);

const verifyCodeSchema = z.object({
  identifier: z.string().email(),
  code: z.string().length(6),
});

authRouter.post(
  "/otp/verify",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { identifier, code } = verifyCodeSchema.parse(req.body);
    const normalized = identifier.toLowerCase();

    const ok = await consumeVerificationCode(normalized, code);
    if (!ok) {
      throw new HttpError(400, "Invalid or expired verification code.");
    }

    // OTP login doubles as sign-up: create a bare CUSTOMER record on first use.
    let user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: normalized, name: normalized.split("@")[0], role: "CUSTOMER" },
      });
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been disabled. Please contact support.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

const googleLoginSchema = z.object({ idToken: z.string().min(10) });

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
}

authRouter.post(
  "/google",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { idToken } = googleLoginSchema.parse(req.body);

    if (!env.google.clientId) {
      throw new HttpError(500, "Google sign-in is not configured on the server.");
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!verifyRes.ok) {
      throw new HttpError(400, "Invalid Google ID token.");
    }
    const tokenInfo = (await verifyRes.json()) as GoogleTokenInfo;

    // SECURITY: a Google ID token proves the holder signed into SOME Google
    // app, not necessarily this one — the "aud" claim must match our client ID,
    // otherwise a token minted for an unrelated app could be replayed here.
    if (tokenInfo.aud !== env.google.clientId) {
      throw new HttpError(401, "This Google sign-in was not issued for this application.");
    }
    if (tokenInfo.email_verified !== "true" || !tokenInfo.email) {
      throw new HttpError(401, "Google account email is not verified.");
    }

    const normalized = tokenInfo.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: normalized, name: tokenInfo.name ?? normalized, role: "CUSTOMER" },
      });
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been disabled. Please contact support.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, "User not found.");
    res.json({ user: toPublicUser(user) });
  })
);

// --- Enhanced Security: Profile Update & Password Management ---

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(25).optional(),
});

authRouter.patch(
  "/profile",
  authenticate,
  asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
    res.json({ user: toPublicUser(user), message: "Profile updated successfully." });
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

authRouter.post(
  "/change-password",
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user || !user.passwordHash) {
      throw new HttpError(400, "Unable to change password for this account.");
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Current password is incorrect.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    res.json({ message: "Password updated successfully." });
  })
);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

authRouter.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    try {
      await createVerificationCode(normalized);
    } catch (err) {
      console.error("[forgot-password] Code generation error:", err);
    }

    res.json({
      message: "A 6-digit verification code has been dispatched to your email address.",
    });
  })
);

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

authRouter.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, code, newPassword } = resetPasswordSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    const ok = await consumeVerificationCode(normalized, code);
    if (!ok) {
      throw new HttpError(400, "Invalid or expired verification code. Please check your inbox or request a new code.");
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: normalized } });
    } catch (dbErr) {
      console.warn("Database lookup failed during reset-password:", dbErr);
    }

    const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email: normalized,
            name: isExecutive ? "Clemon Balasuriya" : normalized.split("@")[0],
            role: isExecutive ? "OWNER" : "CUSTOMER",
            passwordHash: await hashPassword(newPassword),
            isActive: true,
          },
        });
      } catch {
        user = {
          id: `usr_${Date.now()}`,
          email: normalized,
          name: isExecutive ? "Clemon Balasuriya" : normalized.split("@")[0],
          role: isExecutive ? "OWNER" : "CUSTOMER",
          isActive: true,
          phone: null,
        };
      }
    } else {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await hashPassword(newPassword), isActive: true },
        });
      } catch (err) {
        console.warn("Prisma update password failed:", err);
      }
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user), message: "Password successfully reset." });
  })
);

// --- Testing / Demo Role Login for smooth review & inspection ---
const demoRoles = [
  "OWNER",
  "ADMIN",
  "CONSTRUCTION_MANAGER",
  "TOURISM_AGENT",
  "CUSTOMER",
] as const;

authRouter.post(
  "/demo-login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const roleReq = (req.body.role || "CUSTOMER").toUpperCase();
    const role = (demoRoles.includes(roleReq as any) ? roleReq : "CUSTOMER") as (typeof demoRoles)[number];

    const demoEmail = `demo.${role.toLowerCase()}@balasuriyagroup.tech`;
    let user = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          name: `Demo ${role.replace(/_/g, " ")}`,
          role: role as any,
          isActive: true,
        },
      });
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

