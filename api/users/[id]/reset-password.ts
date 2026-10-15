import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import fs from "fs";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const FROM_EMAIL = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";
const ACCOUNTS_FILE = "/tmp/balasuriya_accounts.json";
const USERS_FILE = "/tmp/balasuriya_staff_users.json";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_USERS: UserRecord[] = [
  { id: "usr_clemon_ceo", name: "Mr. Clemon Balasuriya", email: "clemonbalasuriyagroup@gmail.com", role: "OWNER", phone: "+94 77 123 4567", isActive: true, createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "usr_migara", name: "Mr. Migara Fonseka", email: "fonsekamigara@gmail.com", role: "CONSTRUCTION_MANAGER", phone: "+94 77 234 5678", isActive: true, createdAt: "2026-09-02T00:00:00.000Z" },
  { id: "usr_damian", name: "Mr. Damian Balasuriya", email: "damian@balasuriyagroup.tech", role: "TOURISM_AGENT", phone: "+94 77 345 6789", isActive: true, createdAt: "2026-09-03T00:00:00.000Z" },
  { id: "usr_pasindu", name: "Mr. Pasindu Hansana", email: "pasinduhansana@gmail.com", role: "SOFTWARE_ENGINEER", phone: "+94 77 456 7890", isActive: true, createdAt: "2026-09-04T00:00:00.000Z" },
  { id: "usr_shenal", name: "Mr. Shenal Fernando", email: "shenal@balasuriyagroup.tech", role: "TICKET_AGENT", phone: "+94 77 567 8901", isActive: true, createdAt: "2026-09-05T00:00:00.000Z" },
];

function loadUsers(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_USERS;
}

function savePassword(email: string, plainPassword: string): void {
  const normalized = email.toLowerCase().trim();
  const passwordHash = crypto.pbkdf2Sync(plainPassword, HMAC_SECRET, 10000, 64, "sha512").toString("hex");
  try {
    let all: Record<string, any> = {};
    if (fs.existsSync(ACCOUNTS_FILE)) {
      all = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8"));
    }
    all[normalized] = { passwordHash, updatedAt: Date.now() };
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(all, null, 2), "utf-8");
  } catch {}
}

async function sendStaffResetEmail(params: {
  name: string;
  email: string;
  role: string;
  temporaryPassword: string;
}): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return false;

  const target = params.email.toLowerCase().trim();
  const timeTag = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
  const roleName = params.role.replace(/_/g, " ");
  const portalUrl = "https://www.balasuriyagroup.tech/login";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background-color: #0B1E3F; padding: 32px 40px; text-align: center; border-bottom: 3px solid #D4AF37;">
                  <div style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
                    Official Staff Portal
                  </div>
                  <div style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Times New Roman', Georgia, serif;">
                    BALASURIYA GROUP
                  </div>
                  <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">
                    Executive Identity &amp; Staff Provisioning
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 32px 40px;">
                  <h2 style="color: #0B1E3F; font-size: 19px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                    Staff Account Password Reset
                  </h2>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    Dear <strong>${params.name}</strong>,<br/>
                    Your Balasuriya Group staff account password has been reset by the Administrator. Please find your updated credentials below:
                  </p>
                  
                  <div style="background-color: #f1f5f9; border-left: 4px solid #0B1E3F; padding: 16px 20px; border-radius: 6px; margin-bottom: 28px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #1e293b;">
                      <tr>
                        <td style="font-weight: 600; width: 140px; color: #64748b;">Assigned Role:</td>
                        <td style="font-weight: 700; color: #0B1E3F;">${roleName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">Official Email:</td>
                        <td style="font-family: monospace; font-weight: 600;">${target}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">New Temporary Password:</td>
                        <td style="font-family: monospace; font-weight: 700; color: #0B1E3F; font-size: 15px; letter-spacing: 1px;">${params.temporaryPassword}</td>
                      </tr>
                    </table>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom: 28px;">
                        <a href="${portalUrl}" target="_blank" style="background-color: #0B1E3F; color: #ffffff; padding: 14px 36px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(11, 30, 63, 0.25);">
                          Sign In to Staff Portal
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <strong>Security Notice:</strong> For enterprise data protection, please log in and change this temporary password immediately under your account security settings. If you did not anticipate this reset, contact the executive desk at once.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <div style="color: #94a3b8; font-size: 11px;">
                    Balasuriya Group Corporate Governance &bull; 24/7 Security Operations &bull; Colombo, Sri Lanka
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textPayload = `BALASURIYA GROUP — STAFF ACCOUNT PASSWORD RESET\n\nDear ${params.name},\n\nYour staff account password has been reset by the Administrator.\n\nAssigned Role: ${roleName}\nOfficial Email: ${target}\nNew Temporary Password: ${params.temporaryPassword}\nLogin Portal: ${portalUrl}\n\nPlease sign in and change your password immediately.\n\nBalasuriya Group Corporate Headquarters — Colombo, Sri Lanka`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [target],
        reply_to: "security@balasuriyagroup.tech",
        subject: `Staff Account Password Reset — Balasuriya Group [${timeTag}]`,
        headers: {
          "X-Entity-Ref-ID": `${Date.now()}-${target}`,
        },
        html: emailHtml,
        text: textPayload,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[sendStaffResetEmail] error:", err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { temporaryPassword } = req.body || {};

  if (!temporaryPassword || String(temporaryPassword).length < 8) {
    return res.status(400).json({ message: "A temporary password of at least 8 characters is required." });
  }

  const users = loadUsers();
  const targetUser = users.find((u) => u.id === id || u.email.toLowerCase() === String(id).toLowerCase());

  if (!targetUser) {
    return res.status(404).json({ message: "Staff user not found." });
  }

  savePassword(targetUser.email, String(temporaryPassword));

  let emailDispatched = false;
  try {
    emailDispatched = await sendStaffResetEmail({
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      temporaryPassword: String(temporaryPassword),
    });
  } catch (e) {
    console.error("Failed to dispatch password reset email:", e);
  }

  return res.status(200).json({
    message: emailDispatched
      ? `Password reset and sent to ${targetUser.email}.`
      : "Password reset. Share the new temporary password securely.",
    emailDispatched,
  });
}
