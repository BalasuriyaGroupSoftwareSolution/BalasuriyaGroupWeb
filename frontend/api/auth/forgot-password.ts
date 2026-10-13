import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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

  otpStore.set(normalized, { code, expiresAt });
  console.log(`[OTP] Generated 6-digit security code for ${normalized}: ${code}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  let emailSent = false;
  let resendError = "";

  if (resendApiKey) {
    try {
      const recipientList = [normalized];
      if (normalized === "clemonbalasuriyagroup@gmail.com") {
        recipientList.push("avishkaclemon@gmail.com");
      } else if (normalized === "avishkaclemon@gmail.com") {
        recipientList.push("clemonbalasuriyagroup@gmail.com");
      }

      for (const target of recipientList) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Balasuriya Group Security <onboarding@resend.dev>",
            to: [target],
            subject: `Balasuriya Group Security Code: ${code}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0B1E3F;">Balasuriya Group Corporate Security</h2>
                <p>Your single-use 6-digit verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A6E; padding: 18px; background-color: #F4F6F9; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. If you did not request this, please ignore.</p>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log(`[RESEND] Successfully dispatched verification code to ${target}`);
          break;
        } else {
          resendError = await emailRes.text();
          console.warn(`[RESEND] Delivery error for ${target}: ${resendError}`);
        }
      }
    } catch (err: any) {
      resendError = err.message;
      console.error(`[RESEND] Exception:`, err);
    }
  }

  return res.status(200).json({
    message: emailSent
      ? "Verification code dispatched to your email."
      : "Verification code generated. Please check your inbox and spam folder.",
    delivered: emailSent,
    error: resendError ? resendError : undefined,
  });
}
