import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const RESEND_REGISTERED_EMAIL = "balasuriyagroup.software@gmail.com";

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
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // In-memory store backup
  otpStore.set(normalized, { code, expiresAt });
  console.log(`[OTP] Generated 6-digit security code for ${normalized}`);

  // Stateless HMAC token to ensure serverless cross-instance resilience
  const signature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${normalized}:${code}:${expiresAt}`)
    .digest("hex");
  const resetToken = `${expiresAt}:${signature}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;
  let deliveredTo = "";
  let resendError = "";

  if (resendApiKey) {
    try {
      // 1. Attempt sending to requested email address
      const directRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Balasuriya Group Security <onboarding@resend.dev>",
          to: [normalized],
          subject: `Balasuriya Group Security Code: ${code}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Corporate Security</h2>
              <p style="color: #334155;">Password reset verification code requested for account: <strong>${normalized}</strong></p>
              <p style="color: #334155;">Your single-use 6-digit verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A6E; padding: 18px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace;">
                ${code}
              </div>
              <p style="color: #64748b; font-size: 13px;">This security code is strictly confidential, single-use, and valid for 10 minutes.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Balasuriya Group Corporate Security Protocol</p>
            </div>
          `,
        }),
      });

      if (directRes.ok) {
        emailSent = true;
        deliveredTo = normalized;
        console.log(`[RESEND] Direct delivery succeeded for ${normalized}`);
      } else {
        const directErrText = await directRes.text();
        resendError = directErrText;
        console.warn(`[RESEND] Direct delivery failed for ${normalized}: ${directErrText}`);

        // 2. If rejected by Resend sandbox policy (only allows sending to account creator),
        // fallback immediately to the registered account email
        if (normalized !== RESEND_REGISTERED_EMAIL) {
          console.log(`[RESEND] Dispatching to registered security mailbox: ${RESEND_REGISTERED_EMAIL}`);
          const fallbackRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Balasuriya Group Security <onboarding@resend.dev>",
              to: [RESEND_REGISTERED_EMAIL],
              subject: `Balasuriya Group Security Code for ${normalized}: ${code}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                  <h2 style="color: #0B1E3F; margin-top: 0;">Balasuriya Group Corporate Security</h2>
                  <p style="color: #334155;">Password reset verification code requested for account: <strong>${normalized}</strong></p>
                  <p style="color: #334155;">Your single-use 6-digit verification code is:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A6E; padding: 18px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace;">
                    ${code}
                  </div>
                  <p style="color: #64748b; font-size: 13px;">This security code is valid for 10 minutes. Enter this code on the website to reset credentials.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Delivered to executive administrator mailbox (${RESEND_REGISTERED_EMAIL})</p>
                </div>
              `,
            }),
          });

          if (fallbackRes.ok) {
            emailSent = true;
            deliveredTo = RESEND_REGISTERED_EMAIL;
            console.log(`[RESEND] Successfully delivered to registered security email ${RESEND_REGISTERED_EMAIL}`);
          } else {
            resendError = await fallbackRes.text();
            console.error(`[RESEND] Fallback delivery failed: ${resendError}`);
          }
        }
      }
    } catch (err: any) {
      resendError = err.message;
      console.error(`[RESEND] Network exception:`, err);
    }
  }

  let userMsg = "Verification code generated. Please check your inbox and spam folder.";
  if (emailSent) {
    if (deliveredTo === normalized) {
      userMsg = `Verification code sent to ${normalized}. Please check inbox and spam folder.`;
    } else {
      userMsg = `Verification code sent to security mailbox (${deliveredTo}). Please check inbox or spam.`;
    }
  }

  return res.status(200).json({
    message: userMsg,
    delivered: emailSent,
    deliveredTo: emailSent ? deliveredTo : undefined,
    resetToken,
    error: emailSent ? undefined : resendError,
  });
}
