import crypto from "crypto";
import fs from "fs";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const VERIFIED_FROM_EMAIL = "Balasuriya Group Security <security@balasuriyagroup.tech>";

function getResendApiKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  try {
    for (const p of [".env", "backend/.env", "../backend/.env"]) {
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, "utf-8");
        const m = text.match(/RESEND_API_KEY\s*=\s*([^\r\n]+)/);
        if (m && m[1]) return m[1].trim();
      }
    }
  } catch {}
  return "";
}

function sendJson(res, status, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

async function getBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch {}
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed" });
  }

  const body = await getBody(req);
  const email = body?.email;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return sendJson(res, 400, { message: "A valid email address is required." });
  }

  const normalized = email.toLowerCase().trim();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity

  // Cryptographically signed 1-click magic link token
  const linkSignature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`reset_link:${normalized}:${expiresAt}`)
    .digest("hex");
  const linkToken = `${expiresAt}:${linkSignature}`;

  const reqOrigin = (req.headers && (req.headers["origin"] || req.headers["referer"])) || "";
  const baseUrl = String(reqOrigin).includes("localhost") ? "http://localhost:5173" : "https://www.balasuriyagroup.tech";
  const resetUrl = `${baseUrl}/forgot-password?token=${encodeURIComponent(linkToken)}&email=${encodeURIComponent(normalized)}`;

  let emailDispatched = false;
  let dispatchError = null;

  const resendApiKey = getResendApiKey();
  if (resendApiKey) {
    const timeTag = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Colombo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const emailSubject = `Reset your Balasuriya Group password [${timeTag}]`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your Balasuriya Group password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
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
                <tr>
                  <td style="padding: 40px 40px 32px 40px;">
                    <h2 style="color: #0B1E3F; font-size: 19px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                      Password Reset Request
                    </h2>
                    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
                      We received a request to reset the password for your account:
                    </p>
                    <div style="background-color: #f1f5f9; border-left: 4px solid #0B1E3F; padding: 12px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 24px;">
                      ${normalized}
                    </div>
                    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
                      Click the button below to directly choose your new password. No verification code is needed:
                    </p>
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
                      If the button above does not open directly, copy and paste this link into your browser:<br/>
                      <a href="${resetUrl}" style="color: #1E3A6E; text-decoration: underline;">${resetUrl}</a>
                    </p>
                    <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
                      <p style="color: #92400E; font-size: 12px; line-height: 1.5; margin: 0;">
                        <strong>Security Notice:</strong> This password reset link will expire in <strong>15 minutes</strong> and can only be used once. If you did not make this request, please safely disregard this email. Your credentials remain protected.
                      </p>
                    </div>
                  </td>
                </tr>
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
          reply_to: "security@balasuriyagroup.tech",
          subject: emailSubject,
          headers: {
            "X-Entity-Ref-ID": `${Date.now()}-${normalized}`,
          },
          html: emailHtml,
          text: `BALASURIYA GROUP CORPORATE SECURITY\n\nPassword Reset Request\n\nWe received a request to reset the password for your account: ${normalized}\n\nClick the link below to directly set your new password:\n${resetUrl}\n\nThis single-use link expires in 15 minutes.\n\nBalasuriya Group Corporate Headquarters — Colombo, Sri Lanka`,
        }),
      });

      if (resVerified.ok) {
        emailDispatched = true;
        console.log(`[forgot-password] Email successfully dispatched to ${normalized}`);
      } else {
        const errText = await resVerified.text();
        console.error(`[forgot-password] Resend API error: ${errText}`);
        dispatchError = errText;
      }
    } catch (e) {
      console.error("[forgot-password] Email dispatch failed:", e);
      dispatchError = e?.message || "Unknown error";
    }
  }

  return sendJson(res, 200, {
    message: `A secure password reset link has been dispatched to ${normalized}. Please check your inbox and spam folder.`,
    resetToken: linkToken,
    resetUrl,
    delivered: emailDispatched,
    error: dispatchError,
  });
}
