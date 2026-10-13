import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const RESEND_REGISTERED_EMAIL = "balasuriyagroup.software@gmail.com";
const VERIFIED_FROM_EMAIL = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";
const SANDBOX_FROM_EMAIL = "Balasuriya Group Security <onboarding@resend.dev>";

const globalStore = globalThis as unknown as {
  otpStore?: Map<string, { code: string; expiresAt: number }>;
};
if (!globalStore.otpStore) {
  globalStore.otpStore = new Map();
}
export const otpStore = globalStore.otpStore;

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

  const { identifier } = req.body || {};
  if (!identifier || typeof identifier !== "string" || !identifier.includes("@")) {
    return res.status(400).json({ message: "Valid email address is required." });
  }

  const normalized = identifier.toLowerCase().trim();
  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(normalized, { code, expiresAt });

  const signature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${normalized}:${code}:${expiresAt}`)
    .digest("hex");
  const otpToken = `${expiresAt}:${signature}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;
  let deliveredTo = "";
  let resendError = "";

  if (resendApiKey) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Authentication</h2>
        <p style="color: #334155;">Your one-time sign-in code for account <strong>${normalized}</strong> is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A6E; padding: 18px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 13px;">This security code is strictly confidential, single-use, and valid for 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Balasuriya Group Corporate Security Protocol</p>
      </div>
    `;

    // Attempt 1: Verified domain
    try {
      const resVerified = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: VERIFIED_FROM_EMAIL,
          to: [normalized],
          subject: `Balasuriya Group Login Code: ${code}`,
          html: emailHtml,
        }),
      });

      if (resVerified.ok) {
        emailSent = true;
        deliveredTo = normalized;
      } else {
        resendError = await resVerified.text();
      }
    } catch (e: any) {
      resendError = e.message;
    }

    // Attempt 2: Sandbox direct
    if (!emailSent) {
      try {
        const resSandbox = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: SANDBOX_FROM_EMAIL,
            to: [normalized],
            subject: `Balasuriya Group Login Code: ${code}`,
            html: emailHtml,
          }),
        });

        if (resSandbox.ok) {
          emailSent = true;
          deliveredTo = normalized;
        } else {
          resendError = await resSandbox.text();
        }
      } catch (e: any) {
        resendError = e.message;
      }
    }

    // Attempt 3: Sandbox fallback to registered mailbox
    if (!emailSent && normalized !== RESEND_REGISTERED_EMAIL) {
      try {
        const resFallback = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: SANDBOX_FROM_EMAIL,
            to: [RESEND_REGISTERED_EMAIL],
            subject: `Balasuriya Group Login Code for ${normalized}: ${code}`,
            html: emailHtml,
          }),
        });

        if (resFallback.ok) {
          emailSent = true;
          deliveredTo = RESEND_REGISTERED_EMAIL;
        } else {
          resendError = await resFallback.text();
        }
      } catch (e: any) {
        resendError = e.message;
      }
    }
  }

  let userMsg = "Verification code generated. Please check your inbox and spam folder.";
  if (emailSent) {
    if (deliveredTo === normalized) {
      userMsg = `One-time sign-in code sent to ${normalized}.`;
    } else {
      userMsg = `One-time sign-in code sent to security mailbox (${deliveredTo}).`;
    }
  }

  return res.status(200).json({
    message: userMsg,
    delivered: emailSent,
    deliveredTo: emailSent ? deliveredTo : undefined,
    otpToken,
  });
}
