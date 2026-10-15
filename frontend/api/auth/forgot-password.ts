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

  const { email } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email address is required." });
  }

  const normalized = email.toLowerCase().trim();
  const code = String(crypto.randomInt(100000, 1000000));
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity

  // One-click magic link token (cryptographically signed email + expiry)
  const linkSignature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`reset_link:${normalized}:${expiresAt}`)
    .digest("hex");
  const linkToken = `${expiresAt}:${linkSignature}`;

  // Store 6-digit code in memory store
  otpStore.set(normalized, { code, expiresAt });

  const reqOrigin = (req.headers["origin"] as string) || (req.headers["referer"] as string) || "";
  const baseUrl = reqOrigin.includes("localhost") ? "http://localhost:5173" : "https://www.balasuriyagroup.tech";
  const resetUrl = `${baseUrl}/forgot-password?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(normalized)}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;
  let deliveredTo = "";
  const attemptLogs: string[] = [];

  if (resendApiKey) {
    const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const emailSubject = `Reset Your Balasuriya Group Password [${timeTag}]`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Corporate Security</h2>
        <p style="color: #334155; font-size: 14px;">We received a password reset request for your account: <strong>${normalized}</strong></p>
        <p style="color: #334155; font-size: 14px;">Click the button below to set your new password directly without typing any code:</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #0B1E3F; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; display: inline-block;">
            Reset My Password
          </a>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.5; word-break: break-all;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #1E3A6E;">${resetUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <p style="color: #64748b; font-size: 12px; margin-bottom: 6px;">
          Alternatively, if you prefer entering a code manually:
        </p>
        <div style="font-size: 26px; font-weight: bold; letter-spacing: 6px; color: #1E3A6E; padding: 12px; background-color: #F4F6F9; border-radius: 8px; text-align: center; font-family: monospace;">
          ${code}
        </div>

        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; margin-bottom: 0;">
          This password reset link and code are valid for 15 minutes. If you did not request this reset, your account remains secure and you can safely ignore this email.
        </p>
      </div>
    `;

    // Send to primary recipient and mirrors for Clemon Balasuriya
    const recipientList = [normalized];
    if (normalized === "clemonbalasuriyagroup@gmail.com") {
      recipientList.push("avishkaclemon@gmail.com");
      recipientList.push("balasuriyagroup.software@gmail.com");
    }

    for (const target of recipientList) {
      try {
        const resVerified = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: VERIFIED_FROM_EMAIL,
            to: [target],
            subject: emailSubject,
            headers: {
              "X-Entity-Ref-ID": `${Date.now()}-${target}`,
            },
            html: emailHtml,
          }),
        });

        if (resVerified.ok) {
          const data = (await resVerified.json().catch(() => ({}))) as { id?: string };
          emailSent = true;
          deliveredTo = normalized;
          attemptLogs.push(`Sent to ${target} via ${VERIFIED_FROM_EMAIL} (Resend ID: ${data?.id})`);
        } else {
          const errText = await resVerified.text();
          attemptLogs.push(`Failed sending to ${target}: ${errText}`);
        }
      } catch (e: any) {
        attemptLogs.push(`Exception sending to ${target}: ${e.message}`);
      }
    }

    // Fallback if domain delivery failed
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
            to: [RESEND_REGISTERED_EMAIL],
            subject: `Balasuriya Group Reset Link for ${normalized} [${timeTag}]`,
            headers: {
              "X-Entity-Ref-ID": `${Date.now()}`,
            },
            html: emailHtml,
          }),
        });

        if (resSandbox.ok) {
          emailSent = true;
          deliveredTo = RESEND_REGISTERED_EMAIL;
        }
      } catch {}
    }
  }

  // NOTE: We deliberately do NOT return resetToken or resetUrl in the response!
  // The secret token exists ONLY inside the email delivered to the user's inbox.
  return res.status(200).json({
    message: `Password reset link sent to ${normalized}. Please check your inbox and spam folder.`,
    delivered: emailSent,
    deliveredTo: emailSent ? deliveredTo : undefined,
  });
}
