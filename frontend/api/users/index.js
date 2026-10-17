import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

function hashPassword(password) {
  return crypto.pbkdf2Sync(String(password), HMAC_SECRET, 10000, 64, "sha512").toString("hex");
}

function sendJson(res, status, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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
    try {
      return JSON.parse(req.body);
    } catch {}
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function getCandidateAccountFiles() {
  return [
    path.join(os.tmpdir(), "balasuriya_accounts.json"),
    "/tmp/balasuriya_accounts.json",
    path.join(os.tmpdir(), "balasuriya_auth_users.json"),
    "/tmp/balasuriya_auth_users.json",
  ];
}

function loadStoredAccounts() {
  const accounts = {};
  for (const p of getCandidateAccountFiles()) {
    try {
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (Array.isArray(raw)) {
          for (const u of raw) {
            if (u && u.email) {
              accounts[u.email.toLowerCase().trim()] = u;
            }
          }
        } else if (raw && typeof raw === "object") {
          for (const [k, v] of Object.entries(raw)) {
            if (v && typeof v === "object") {
              accounts[k.toLowerCase().trim()] = v;
            }
          }
        }
      }
    } catch {}
  }
  return accounts;
}

function saveAccount(userObj) {
  const normalized = userObj.email.toLowerCase().trim();
  for (const p of getCandidateAccountFiles()) {
    try {
      let accounts = {};
      if (fs.existsSync(p)) {
        try {
          const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
          if (Array.isArray(raw)) {
            for (const item of raw) {
              if (item && item.email) accounts[item.email.toLowerCase().trim()] = item;
            }
          } else if (raw && typeof raw === "object") {
            accounts = raw;
          }
        } catch {}
      }
      accounts[normalized] = {
        ...userObj,
        updatedAt: Date.now(),
      };
      fs.writeFileSync(p, JSON.stringify(accounts, null, 2), "utf-8");
    } catch {}
  }
}

function deleteAccount(emailOrId) {
  const norm = String(emailOrId).toLowerCase().trim();
  for (const p of getCandidateAccountFiles()) {
    try {
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
        let updated = {};
        if (Array.isArray(raw)) {
          updated = raw.filter((u) => u.email?.toLowerCase().trim() !== norm && u.id !== norm);
        } else if (raw && typeof raw === "object") {
          for (const [k, v] of Object.entries(raw)) {
            if (k.toLowerCase().trim() !== norm && v.id !== norm) {
              updated[k] = v;
            }
          }
        }
        fs.writeFileSync(p, JSON.stringify(updated, null, 2), "utf-8");
      }
    } catch {}
  }
}

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

async function sendStaffWelcomeEmail(params) {
  const apiKey = getResendApiKey();
  if (!apiKey) return { success: false, error: "No RESEND_API_KEY" };

  const target = params.email.toLowerCase().trim();
  const timeTag = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
  });
  const roleName = String(params.role || "Staff Member").replace(/_/g, " ");
  const fromEmail = process.env.FROM_EMAIL || "Balasuriya Group Security <security@balasuriyagroup.tech>";

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
                    ${params.isReset ? "Staff Account Password Reset" : "Welcome to Balasuriya Group"}
                  </h2>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    Dear <strong>${params.name}</strong>,<br/>
                    ${
                      params.isReset
                        ? "Your Balasuriya Group staff account password has been reset by the Administrator. Please find your credentials below:"
                        : "Your official staff account has been provisioned on the Balasuriya Group Corporate Management Portal. Below are your login credentials:"
                    }
                  </p>
                  
                  <div style="background-color: #f1f5f9; border-left: 4px solid #0B1E3F; padding: 16px 20px; border-radius: 6px; margin-bottom: 28px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #1e293b;">
                      <tr>
                        <td style="font-weight: 600; width: 140px; color: #64748b;">Assigned Role:</td>
                        <td style="font-weight: 700; color: #0B1E3F;">${roleName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">Official Email:</td>
                        <td style="font-weight: 600;"><a href="mailto:${params.email}" style="color: #1e40af; text-decoration: none;">${params.email}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #64748b;">Temporary Password:</td>
                        <td style="font-family: monospace; font-size: 15px; font-weight: bold; color: #b45309; letter-spacing: 1px;">
                          ${params.temporaryPassword}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://www.balasuriyagroup.tech/login" style="display: inline-block; background-color: #0B1E3F; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(11, 30, 63, 0.25);">
                      Sign In to Staff Console &rarr;
                    </a>
                  </div>

                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
                    Please change your password upon your first sign in from your account settings. This is an automated corporate notification dispatched at ${timeTag}.
                  </p>
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
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail.includes("<") ? fromEmail : `Balasuriya Group Security <${fromEmail}>`,
        to: [target],
        subject: `${params.isReset ? "Your Staff Account Password Has Been Reset" : "Your Official Balasuriya Group Staff Account Credentials"} [${timeTag}]`,
        html: emailHtml,
      }),
    });
    return { success: res.ok };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

const INITIAL_DEMO_USERS = [
  {
    id: "usr_owner_1",
    name: "Mr. Clemon Balasuriya",
    email: "clemonbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "OWNER",
    department: "Executive Board",
    jobTitle: "Group Chairman & CEO",
    assignedDivisions: ["Executive Board", "Construction & Engineering", "Tourism & Travel", "Software Solutions", "Air Ticketing", "Finance & Accounts"],
    isActive: true,
  },
  {
    id: "usr_md_2",
    name: "Mr. Damian Balasuriya",
    email: "damianbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    secondaryRoles: ["TOURISM_AGENT"],
    department: "Executive Board",
    jobTitle: "Managing Director & Head of Tourism",
    assignedDivisions: ["Executive Board", "Tourism & Travel"],
    isActive: true,
  },
  {
    id: "usr_ed_3",
    name: "Mr. Clavo Balasuriya",
    email: "clavobalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "FINANCE_APPROVER",
    department: "Finance & Accounts",
    jobTitle: "Executive Director & Finance",
    assignedDivisions: ["Executive Board", "Finance & Accounts"],
    isActive: true,
  },
  {
    id: "usr_dir_4",
    name: "Mrs. Christina Balasuriya",
    email: "christinabalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    department: "Executive Board",
    jobTitle: "Executive Director & Corporate Affairs",
    assignedDivisions: ["Executive Board"],
    isActive: true,
  },
  {
    id: "usr_migara_5",
    name: "Mr. Migara Fonseka",
    email: "fonsekamigara@gmail.com",
    phone: "+94 77 234 5678",
    role: "CONSTRUCTION_MANAGER",
    department: "Construction & Engineering",
    jobTitle: "Head of Construction & Engineering",
    assignedDivisions: ["Construction & Engineering"],
    isActive: true,
  },
  {
    id: "usr_pasindu_6",
    name: "Mr. Pasindu Hansana",
    email: "pasinduhansana@gmail.com",
    phone: "+94 77 456 7890",
    role: "SOFTWARE_ENGINEER",
    secondaryRoles: ["TICKET_AGENT"],
    department: "Software Solutions",
    jobTitle: "Head of Software & Aviation Tech Lead",
    assignedDivisions: ["Software Solutions", "Air Ticketing"],
    isActive: true,
  },
  {
    id: "usr_shenal_7",
    name: "Mr. Shenal Fernando",
    email: "shenal@balasuriyagroup.tech",
    phone: "+94 77 567 8901",
    role: "TICKET_AGENT",
    department: "Air Ticketing",
    jobTitle: "Head of Air Ticketing & Global Desk",
    assignedDivisions: ["Air Ticketing"],
    isActive: true,
  },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.url;
  const url = new URL(matchedPath, `https://${req.headers.host || "localhost"}`);
  const pathParts = url.pathname.replace(/^\/api\/users\/?/, "").split("/").filter(Boolean);
  const targetId = pathParts[0] || req.query?.id;
  const isResetAction = pathParts[1] === "reset-password" || url.pathname.endsWith("/reset-password");

  // GET /api/users
  if (req.method === "GET") {
    const stored = loadStoredAccounts();
    const map = new Map();

    for (const u of INITIAL_DEMO_USERS) {
      map.set(u.email.toLowerCase(), { ...u });
    }

    for (const [email, u] of Object.entries(stored)) {
      if (u && typeof u === "object") {
        const existing = map.get(email) || {};
        map.set(email, {
          id: u.id || existing.id || `usr_${Date.now()}`,
          name: u.name || existing.name || email.split("@")[0],
          email,
          phone: u.phone || existing.phone || null,
          role: u.role || existing.role || "STAFF",
          department: u.department || existing.department || null,
          jobTitle: u.jobTitle || existing.jobTitle || null,
          secondaryRoles: u.secondaryRoles || existing.secondaryRoles || [],
          assignedDivisions: u.assignedDivisions || existing.assignedDivisions || (u.department ? [u.department] : []),
          isActive: u.isActive !== false,
          createdAt: u.createdAt || existing.createdAt || new Date().toISOString(),
        });
      }
    }

    const users = Array.from(map.values());
    return sendJson(res, 200, { users });
  }

  // POST /api/users (Create new staff account OR Reset Password)
  if (req.method === "POST") {
    const body = (await getBody(req)) || {};

    // Password reset subpath
    if (isResetAction) {
      const temporaryPassword = body.temporaryPassword || body.password;
      if (!temporaryPassword) {
        return sendJson(res, 400, { message: "temporaryPassword is required." });
      }
      const stored = loadStoredAccounts();
      let matchedUser = null;
      for (const u of Object.values(stored)) {
        if (u.id === targetId || u.email?.toLowerCase() === targetId?.toLowerCase()) {
          matchedUser = u;
          break;
        }
      }
      if (!matchedUser) {
        matchedUser = INITIAL_DEMO_USERS.find(
          (u) => u.id === targetId || u.email.toLowerCase() === targetId?.toLowerCase()
        );
      }

      if (matchedUser) {
        const passwordHash = hashPassword(temporaryPassword);
        saveAccount({
          ...matchedUser,
          passwordHash,
        });
        let emailDispatched = false;
        try {
          const mRes = await sendStaffWelcomeEmail({
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            temporaryPassword,
            isReset: true,
          });
          emailDispatched = mRes.success;
        } catch {}
        return sendJson(res, 200, {
          success: true,
          emailDispatched,
          message: "Password reset complete.",
        });
      }

      return sendJson(res, 200, {
        success: true,
        emailDispatched: false,
        message: "Password reset registered.",
      });
    }

    // Normal Staff Creation
    const {
      name,
      email,
      phone,
      role = "TOURISM_STAFF",
      department,
      jobTitle,
      secondaryRoles = [],
      assignedDivisions = [],
      temporaryPassword,
    } = body;

    if (!name || !email || !temporaryPassword) {
      return sendJson(res, 400, {
        message: "Staff name, official email address, and temporary password are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const passwordHash = hashPassword(temporaryPassword);

    const newUserObj = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : null,
      role: String(role).trim(),
      department: department ? String(department).trim() : null,
      jobTitle: jobTitle ? String(jobTitle).trim() : null,
      secondaryRoles: Array.isArray(secondaryRoles) ? secondaryRoles : [],
      assignedDivisions: Array.isArray(assignedDivisions) && assignedDivisions.length > 0
        ? assignedDivisions
        : (department ? [department] : []),
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    saveAccount(newUserObj);

    let emailDispatched = false;
    try {
      const mailRes = await sendStaffWelcomeEmail({
        name: newUserObj.name,
        email: newUserObj.email,
        role: newUserObj.role,
        temporaryPassword,
        isReset: false,
      });
      emailDispatched = mailRes.success;
    } catch (mailErr) {
      console.warn("[users] Welcome email dispatch error:", mailErr);
    }

    return sendJson(res, 201, {
      user: newUserObj,
      emailDispatched,
      message: `Staff account successfully created for ${newUserObj.name}.`,
    });
  }

  // PATCH /api/users or /api/users/:id
  if (req.method === "PATCH") {
    const body = (await getBody(req)) || {};
    const stored = loadStoredAccounts();
    const idToUpdate = targetId || body.id;
    const emailToUpdate = body.email ? String(body.email).toLowerCase().trim() : null;

    let targetKey = null;
    let existingObj = null;

    for (const [em, u] of Object.entries(stored)) {
      if (u.id === idToUpdate || em === emailToUpdate || em === idToUpdate?.toLowerCase()) {
        targetKey = em;
        existingObj = u;
        break;
      }
    }

    if (!existingObj) {
      const demo = INITIAL_DEMO_USERS.find(
        (u) => u.id === idToUpdate || u.email.toLowerCase() === emailToUpdate || u.email.toLowerCase() === idToUpdate?.toLowerCase()
      );
      if (demo) {
        targetKey = demo.email.toLowerCase();
        existingObj = { ...demo };
      }
    }

    if (!existingObj) {
      existingObj = {
        id: idToUpdate || `usr_${Date.now()}`,
        email: emailToUpdate || idToUpdate,
        name: body.name || "Staff Member",
        role: body.role || "STAFF",
        isActive: true,
      };
      targetKey = existingObj.email.toLowerCase();
    }

    const updated = {
      ...existingObj,
      ...body,
      id: existingObj.id,
      email: targetKey,
      updatedAt: Date.now(),
    };

    saveAccount(updated);

    return sendJson(res, 200, {
      user: updated,
      message: "Staff member details updated successfully.",
    });
  }

  // DELETE /api/users/:id
  if (req.method === "DELETE") {
    const queryEmail = req.query?.email;
    const toDelete = targetId || queryEmail;
    if (toDelete) {
      deleteAccount(toDelete);
      if (queryEmail) deleteAccount(queryEmail);
    }
    return sendJson(res, 200, {
      success: true,
      message: "Staff account removed successfully.",
    });
  }

  return sendJson(res, 405, { message: "Method not allowed" });
}
