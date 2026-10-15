import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const VERIFIED_FROM_EMAIL = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";

const globalStore = globalThis as unknown as {
  otpStore?: Map<string, { code: string; expiresAt: number }>;
  consumedResetTokens?: Set<string>;
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
    return res.status(400).json({ message: "A valid registered email address is required." });
  }

  const normalized = email.toLowerCase().trim();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity
  const code = String(crypto.randomInt(100000, 1000000));

  // Cryptographically signed 1-click magic link token
  const linkSignature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`reset_link:${normalized}:${expiresAt}`)
    .digest("hex");
  const linkToken = `${expiresAt}:${linkSignature}`;

  // Store in-memory code backup
  otpStore.set(normalized, { code, expiresAt });

  const reqOrigin = (req.headers["origin"] as string) || (req.headers["referer"] as string) || "";
  const baseUrl = reqOrigin.includes("localhost") ? "http://localhost:5173" : "https://www.balasuriyagroup.tech";
  const resetUrl = `${baseUrl}/forgot-password?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(normalized)}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  let emailDispatched = false;

  if (resendApiKey) {
    const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const emailSubject = `Balasuriya Group Security — Password Reset Link [${timeTag}]`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Balasuriya Group Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                
                <!-- Corporate Header Banner -->
                <tr>
                  <td style="background-color: #0B1E3F; padding: 32px 40px; text-align: center; border-bottom: 3px solid #D4AF37;">
                    <div style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
                      Official Corporate Portal
                    </div>
                    <div style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Times New Roman', Georgia, serif;">
                      BALASURIYA GROUP
                    </div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">
                      Executive Cybersecurity & Account Governance
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px 40px 32px 40px;">
                    <h2 style="color: #0B1E3F; font-size: 19px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                      Password Reset Protocol
                    </h2>
                    
                    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
                      A security request was initiated to reset the password for your registered corporate account:
                    </p>

                    <div style="background-color: #f1f5f9; border-left: 4px solid #0B1E3F; padding: 12px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 24px;">
                      ${normalized}
                    </div>

                    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
                      To establish your new secure password, click the verification button below. No manual verification code is required.
                    </p>

                    <!-- Direct Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 28px;">
                          <a href="${resetUrl}" target="_blank" style="background-color: #0B1E3F; color: #ffffff; padding: 15px 36px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(11, 30, 63, 0.25); letter-spacing: 0.5px;">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #64748b; font-size: 12px; line-height: 1.6; word-break: break-all; margin-bottom: 24px;">
                      If the button does not open directly, copy and paste this link into your secure browser:<br/>
                      <a href="${resetUrl}" style="color: #1E3A6E; text-decoration: underline;">${resetUrl}</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />

                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 8px;">
                      Alternatively, if you prefer entering a code manually in your active browser session:
                    </p>
                    <div style="font-size: 24px; font-weight: 800; letter-spacing: 6px; color: #1E3A6E; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; font-family: monospace; margin-bottom: 24px;">
                      ${code}
                    </div>

                    <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
                      <p style="color: #92400E; font-size: 12px; line-height: 1.5; margin: 0;">
                        <strong>Security Notice:</strong> This password reset link and code will expire in <strong>15 minutes</strong> and can only be used once. If you did not make this request, please safely disregard this notice. Your account remains protected.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Corporate Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                    <strong>Balasuriya Group Corporate Headquarters</strong><br/>
                    Colombo, Sri Lanka &bull; <a href="https://www.balasuriyagroup.tech" style="color: #64748b; text-decoration: none;">www.balasuriyagroup.tech</a><br/>
                    &copy; ${new Date().getFullYear()} Balasuriya Group. All Rights Reserved. Confidential Corporate Communication.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Strictly send ONLY to the specific registered email address that was requested
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
          subject: emailSubject,
          headers: {
            "X-Entity-Ref-ID": `${Date.now()}-${normalized}`,
          },
          html: emailHtml,
        }),
      });

      if (resVerified.ok) {
        emailDispatched = true;
      }
    } catch (e: any) {
      console.error("[forgot-password] Email dispatch failed:", e);
    }
  }

  // Pure security: Never leak resetToken or resetUrl in the response payload
  return res.status(200).json({
    message: `A secure password reset link has been dispatched to ${normalized}. Please check your inbox and spam folder.`,
    delivered: emailDispatched,
  });
}
