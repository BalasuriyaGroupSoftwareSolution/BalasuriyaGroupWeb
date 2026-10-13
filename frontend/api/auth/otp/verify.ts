import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

const globalStore = globalThis as unknown as {
  otpStore?: Map<string, { code: string; expiresAt: number }>;
};
const otpStore = globalStore.otpStore || new Map();

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

  const { identifier, code, otpToken } = req.body || {};
  if (!identifier || !code) {
    return res.status(400).json({ message: "Identifier and code are required." });
  }

  const cleanCode = String(code).trim();
  if (cleanCode.length !== 6) {
    return res.status(400).json({ message: "Verification code must be exactly 6 digits." });
  }

  const normalized = identifier.toLowerCase().trim();
  let codeValid = false;

  // 1. Verify via stateless HMAC token
  if (otpToken && typeof otpToken === "string" && otpToken.includes(":")) {
    const [expiryStr, sig] = otpToken.split(":");
    const expiry = parseInt(expiryStr, 10);
    if (!isNaN(expiry) && Date.now() < expiry) {
      const expected = crypto
        .createHmac("sha256", HMAC_SECRET)
        .update(`${normalized}:${cleanCode}:${expiry}`)
        .digest("hex");
      if (sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
        codeValid = true;
      }
    }
  }

  // 2. In-memory check
  if (!codeValid) {
    const record = otpStore.get(normalized);
    if (record && record.code === cleanCode && record.expiresAt > Date.now()) {
      codeValid = true;
      otpStore.delete(normalized);
    }
  }

  if (!codeValid) {
    return res.status(400).json({ message: "Invalid or expired verification code." });
  }

  const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");
  const user = {
    id: `usr_otp_${Date.now()}`,
    name: isExecutive ? "Clemon Balasuriya" : normalized.split("@")[0],
    email: normalized,
    role: isExecutive ? "OWNER" : "CUSTOMER",
    phone: null,
    isActive: true,
  };

  return res.status(200).json({
    token: `live_jwt_token_${Date.now()}`,
    user,
  });
}
