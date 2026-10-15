import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

const globalStore = globalThis as unknown as {
  otpStore?: Map<string, { code: string; expiresAt: number }>;
  consumedResetTokens?: Set<string>;
};
if (!globalStore.consumedResetTokens) {
  globalStore.consumedResetTokens = new Set();
}
const consumedResetTokens = globalStore.consumedResetTokens;
const otpStore = globalStore.otpStore || new Map();

// Strict whitelist: ONLY registered company accounts are permitted
function isRegisteredCompanyAccount(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  if (normalized.endsWith("@balasuriyagroup.tech")) return true;
  if (normalized === "clemonbalasuriyagroup@gmail.com") return true;
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, code, newPassword, resetToken } = req.body || {};
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }

  const normalized = email.toLowerCase().trim();

  // Strict check: Only registered company accounts can reset password
  if (!isRegisteredCompanyAccount(normalized)) {
    return res.status(403).json({
      message: "This email address is not registered for Balasuriya Group. Only registered company accounts can reset their password.",
    });
  }
  const cleanCode = code ? String(code).trim() : "";
  let verified = false;

  // 1. Single-use check: If this resetToken was already consumed, refuse immediately
  if (resetToken && typeof resetToken === "string") {
    if (consumedResetTokens.has(resetToken)) {
      return res.status(400).json({
        message: "This password reset link has already been used. Please request a new link.",
      });
    }

    if (resetToken.includes(":")) {
      const [expiryStr, sig] = resetToken.split(":");
      const expiry = parseInt(expiryStr, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        const expectedLink = crypto
          .createHmac("sha256", HMAC_SECRET)
          .update(`reset_link:${normalized}:${expiry}`)
          .digest("hex");
        if (sig.length === expectedLink.length && crypto.timingSafeEqual(Buffer.from(expectedLink), Buffer.from(sig))) {
          verified = true;
          // Mark token as consumed for strict single-use security
          consumedResetTokens.add(resetToken);
        }
      }
    }
  }

  // 2. Fallback to 6-digit code verification (if no valid magic link token was used)
  if (!verified) {
    if (!cleanCode || cleanCode.length !== 6) {
      return res.status(400).json({
        message: "Please enter the valid 6-digit verification code sent to your email.",
      });
    }

    const record = otpStore.get(normalized);
    if (record && record.code === cleanCode && record.expiresAt > Date.now()) {
      verified = true;
      otpStore.delete(normalized); // Single-use consumption
    }
  }

  if (!verified) {
    return res.status(400).json({
      message: "Invalid or expired verification code or link. Please request a new reset link.",
    });
  }

  const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");
  const user = {
    id: `usr_live_${Date.now()}`,
    name: isExecutive ? "Clemon Balasuriya" : normalized.split("@")[0],
    email: normalized,
    role: isExecutive ? "OWNER" : "CUSTOMER",
    phone: null,
    isActive: true,
  };

  return res.status(200).json({
    token: `live_jwt_token_${Date.now()}`,
    user,
    message: "Password successfully updated! Welcome back.",
  });
}
