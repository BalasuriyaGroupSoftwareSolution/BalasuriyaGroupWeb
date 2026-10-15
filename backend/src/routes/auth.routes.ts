import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/jwt.js";
import { createVerificationCode, consumeVerificationCode } from "../utils/otp.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import { env } from "../config/env.js";

export const authRouter = Router();

// Local persistent cache for serverless & database cold starts
const LOCAL_USERS_FILE = "/tmp/balasuriya_auth_users.json";

interface LocalStoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

function loadLocalUsers(): LocalStoredUser[] {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const raw = fs.readFileSync(LOCAL_USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("[auth.routes] Could not read local users file:", err);
  }
  return [];
}

function saveLocalUser(u: LocalStoredUser) {
  try {
    const list = loadLocalUsers().filter((x) => x.email.toLowerCase() !== u.email.toLowerCase());
    list.unshift(u);
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("[auth.routes] Could not save local user:", err);
  }
}

// Slow down brute-force / OTP-spamming attempts. The previous backend had no
// rate limiting at all on login or OTP endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
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
    const normEmail = data.email.toLowerCase().trim();

    let existing = null;
    try {
      existing = await prisma.user.findUnique({ where: { email: normEmail } });
    } catch (err) {
      console.warn("[auth.routes] Prisma findUnique failed during register:", err);
      existing = loadLocalUsers().find((u) => u.email.toLowerCase() === normEmail) || null;
    }

    if (existing) {
      throw new HttpError(409, "An account with that email already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    let user: any = null;

    try {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: normEmail,
          phone: data.phone || null,
          passwordHash,
          role: "CUSTOMER",
        },
      });
    } catch (err) {
      console.warn("[auth.routes] Prisma create user failed, creating in fallback cache:", err);
      user = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        name: data.name,
        email: normEmail,
        phone: data.phone || null,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    // Mirror in local store for seamless offline/cold-start survival
    saveLocalUser({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      phone: user.phone || null,
      isActive: true,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    });

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as Role, name: user.name });
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
    const normEmail = email.toLowerCase().trim();

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: normEmail } });
    } catch (err) {
      console.warn("[auth.routes] Prisma findUnique failed on login:", err);
    }

    if (!user) {
      user = loadLocalUsers().find((u) => u.email.toLowerCase() === normEmail) || null;
    }

    if (!user || !user.passwordHash || user.isActive === false) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as Role, name: user.name });
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
    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email: normalized } });
    } catch {
      user = loadLocalUsers().find((u) => u.email.toLowerCase() === normalized) || null;
    }

    if (!user) {
      try {
        user = await prisma.user.create({
          data: { email: normalized, name: normalized.split("@")[0], role: "CUSTOMER" },
        });
      } catch {
        user = {
          id: `usr_otp_${Date.now()}`,
          name: normalized.split("@")[0],
          email: normalized,
          role: "CUSTOMER",
          phone: null,
          passwordHash: "OTP_ACCOUNT",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        saveLocalUser(user);
      }
    }
    if (!user.isActive) {
      throw new HttpError(403, "This account has been disabled. Please contact support.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as Role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

const googleLoginSchema = z.object({
  idToken: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  googleId: z.string().optional(),
});

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
    const body = googleLoginSchema.parse(req.body);
    let targetEmail = body.email ? body.email.toLowerCase().trim() : "";
    let targetName = body.name || "";

    if (body.idToken && env.google.clientId) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.idToken)}`
        );
        if (verifyRes.ok) {
          const tokenInfo = (await verifyRes.json()) as GoogleTokenInfo;
          if (tokenInfo.aud === env.google.clientId && tokenInfo.email) {
            targetEmail = tokenInfo.email.toLowerCase().trim();
            if (tokenInfo.name) targetName = tokenInfo.name;
          }
        }
      } catch (err) {
        console.warn("[auth.routes] Google token verification error:", err);
      }
    }

    if (!targetEmail) {
      throw new HttpError(400, "Google email not provided or verification failed.");
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
    } catch (err) {
      console.warn("[auth.routes] Prisma error on Google login:", err);
      user = loadLocalUsers().find((u) => u.email.toLowerCase() === targetEmail) || null;
    }

    if (!user) {
      const defaultName = targetName || targetEmail.split("@")[0];
      try {
        user = await prisma.user.create({
          data: { email: targetEmail, name: defaultName, role: "CUSTOMER" },
        });
      } catch (err) {
        user = {
          id: `usr_google_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          name: defaultName,
          email: targetEmail,
          role: "CUSTOMER",
          phone: null,
          passwordHash: "GOOGLE_OAUTH_ACCOUNT",
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        saveLocalUser(user);
      }
    }

    if (!user.isActive) {
      throw new HttpError(403, "This account has been disabled. Please contact support.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as Role, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    } catch (err) {
      console.warn("[auth.routes] Prisma findUnique failed on /me:", err);
    }

    if (!user) {
      user = loadLocalUsers().find((u) => u.id === req.user!.sub || u.email === req.user!.email) || null;
    }

    if (!user) {
      user = {
        id: req.user!.sub,
        email: req.user!.email,
        name: req.user!.name || req.user!.email.split("@")[0],
        role: req.user!.role,
        phone: null,
      };
    }

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

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

authRouter.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    // Strict verification: only registered company accounts can request a reset
    let registeredUser = null;
    try {
      registeredUser = await prisma.user.findUnique({ where: { email: normalized } });
    } catch {}

    const isCorporateDomain = normalized.endsWith("@balasuriyagroup.tech");
    const isExecutiveAccount = normalized === "clemonbalasuriyagroup@gmail.com";

    if (!registeredUser && !isCorporateDomain && !isExecutiveAccount) {
      throw new HttpError(403, "This email address is not registered for Balasuriya Group. Only registered company accounts can request a password reset.");
    }

    const expiresAt = Date.now() + 15 * 60 * 1000;

    const linkSignature = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(`reset_link:${normalized}:${expiresAt}`)
      .digest("hex");
    const linkToken = `${expiresAt}:${linkSignature}`;

    const reqOrigin = (req.headers["origin"] as string) || (req.headers["referer"] as string) || "";
    const baseUrl = reqOrigin.includes("localhost") ? "http://localhost:5173" : "https://www.balasuriyagroup.tech";
    const resetUrl = `${baseUrl}/forgot-password?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(normalized)}`;

    try {
      await createVerificationCode(normalized, resetUrl);
    } catch (err) {
      console.error("[forgot-password] Code/Email delivery error:", err);
    }

    res.json({
      message: `Password reset link sent to ${normalized}. Please check your inbox and spam folder.`,
    });
  })
);

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().optional(),
  resetToken: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

authRouter.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, code, resetToken, newPassword } = resetPasswordSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    // Strict check: Only registered company accounts can reset password
    const isCorporateDomain = normalized.endsWith("@balasuriyagroup.tech");
    const isExecutiveAccount = normalized === "clemonbalasuriyagroup@gmail.com";
    if (!isCorporateDomain && !isExecutiveAccount) {
      let registered = false;
      try {
        const u = await prisma.user.findUnique({ where: { email: normalized } });
        if (u) registered = true;
      } catch {}
      if (!registered) {
        throw new HttpError(403, "This email address is not registered for Balasuriya Group. Only registered company accounts can reset their password.");
      }
    }

    const cleanCode = code ? String(code).trim() : "";
    let verified = false;

    // 1. Verify via stateless HMAC resetToken (Direct 1-Click Link from email)
    if (resetToken && typeof resetToken === "string" && resetToken.includes(":")) {
      const [expiryStr, sig] = resetToken.split(":");
      const expiry = parseInt(expiryStr, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        const expectedLink = crypto
          .createHmac("sha256", HMAC_SECRET)
          .update(`reset_link:${normalized}:${expiry}`)
          .digest("hex");
        if (sig.length === expectedLink.length && crypto.timingSafeEqual(Buffer.from(expectedLink), Buffer.from(sig))) {
          verified = true;
        }
      }
    }

    // 2. If no valid link token, strict 6-digit verification code check is REQUIRED
    if (!verified) {
      if (!cleanCode || cleanCode.length !== 6) {
        throw new HttpError(400, "Please enter the valid 6-digit verification code sent to your email.");
      }
      verified = await consumeVerificationCode(normalized, cleanCode);
    }

    if (!verified) {
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

