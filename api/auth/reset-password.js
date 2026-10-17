import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

const KNOWN_STAFF = {
  "clemonbalasuriyagroup@gmail.com": true,
  "owner@balasuriyagroup.tech": true,
  "damianbalasuriyagroup@gmail.com": true,
  "damian@balasuriyagroup.tech": true,
  "clavobalasuriyagroup@gmail.com": true,
  "christinabalasuriyagroup@gmail.com": true,
  "fonsekamigara@gmail.com": true,
  "kaveen.construction@balasuriyagroup.tech": true,
  "nimal.projects@balasuriyagroup.tech": true,
  "rashmi.tours@balasuriyagroup.tech": true,
  "dinuka.visa@balasuriyagroup.tech": true,
  "pasinduhansana@gmail.com": true,
  "thilina.dev@balasuriyagroup.tech": true,
  "sanduni.qa@balasuriyagroup.tech": true,
  "shenal@balasuriyagroup.tech": true,
  "chathuri.flights@balasuriyagroup.tech": true,
  "sunil.accounts@balasuriyagroup.tech": true,
  "balasuriyagroup.info@gmail.com": true,
};

function isRegisteredEmail(email) {
  const norm = String(email || "").toLowerCase().trim();
  if (!norm) return false;
  if (KNOWN_STAFF[norm]) return true;

  const candidatePaths = [
    path.join(os.tmpdir(), "balasuriya_accounts.json"),
    "/tmp/balasuriya_accounts.json",
    path.join(os.tmpdir(), "balasuriya_auth_users.json"),
    "/tmp/balasuriya_auth_users.json"
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const data = JSON.parse(raw);
        if (data && data[norm]) return true;
        if (Array.isArray(data) && data.some((u) => u.email && u.email.toLowerCase().trim() === norm)) {
          return true;
        }
      }
    } catch {}
  }
  return false;
}

const globalStore = globalThis;
if (!globalStore.consumedResetTokens) {
  globalStore.consumedResetTokens = new Set();
}
const consumedResetTokens = globalStore.consumedResetTokens;

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
  const { email, newPassword, resetToken } = body || {};
  if (!email || !newPassword) {
    return sendJson(res, 400, { message: "Email and new password are required." });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return sendJson(res, 400, { message: "New password must be at least 8 characters." });
  }

  const normalized = email.toLowerCase().trim();

  // Strict check 1: Email MUST be registered
  if (!isRegisteredEmail(normalized)) {
    return sendJson(res, 404, {
      message: "No registered account found with this email address. Password cannot be changed.",
    });
  }

  // Strict check 2: A valid cryptographic reset token sent to this email is REQUIRED
  if (!resetToken || typeof resetToken !== "string" || !resetToken.includes(":")) {
    return sendJson(res, 403, {
      message: "A valid, secure password reset link token is required. Please use the link sent to your email.",
    });
  }

  // Reject any synthetic bypass tokens
  if (resetToken === "verified_session" || resetToken.includes("local_fallback")) {
    return sendJson(res, 403, {
      message: "Invalid reset token. Direct bypass is prohibited. Please use the link sent to your email.",
    });
  }

  const [expiryStr, sig] = resetToken.split(":");
  const expiry = parseInt(expiryStr, 10);

  if (isNaN(expiry) || Date.now() > expiry) {
    return sendJson(res, 400, {
      message: "This password reset link has expired (validity is 15 minutes). Please request a new link.",
    });
  }

  if (consumedResetTokens.has(resetToken)) {
    return sendJson(res, 400, {
      message: "This password reset link has already been used. Please request a new link.",
    });
  }

  const expectedLink = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`reset_link:${normalized}:${expiry}`)
    .digest("hex");

  if (
    sig.length !== expectedLink.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedLink), Buffer.from(sig))
  ) {
    return sendJson(res, 403, {
      message: "Invalid or forged password reset link. Authentication failed.",
    });
  }

  // Token is valid! Mark as consumed immediately
  consumedResetTokens.add(resetToken);

  // Compute secure password hash
  const passwordHash = crypto.pbkdf2Sync(String(newPassword), HMAC_SECRET, 10000, 64, "sha512").toString("hex");
  const authHashSig = crypto.createHmac("sha256", HMAC_SECRET).update(`${normalized}:${passwordHash}`).digest("hex");
  const authHash = `${passwordHash}:${authHashSig}`;

  // Persist updated password to accounts store
  const candidateAccountFiles = [
    path.join(os.tmpdir(), "balasuriya_accounts.json"),
    "/tmp/balasuriya_accounts.json",
  ];

  for (const acFile of candidateAccountFiles) {
    try {
      let all = {};
      if (fs.existsSync(acFile)) {
        all = JSON.parse(fs.readFileSync(acFile, "utf-8"));
      }
      all[normalized] = { passwordHash, updatedAt: Date.now() };
      fs.writeFileSync(acFile, JSON.stringify(all, null, 2), "utf-8");
      break;
    } catch {}
  }

  res.setHeader(
    "Set-Cookie",
    `bg_auth_hash=${encodeURIComponent(authHash)}; Path=/; Max-Age=31536000; SameSite=Lax`
  );

  const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");
  const user = {
    id: `usr_${Date.now()}`,
    name: isExecutive ? "Mr. Clemon Balasuriya" : normalized.split("@")[0],
    email: normalized,
    role: isExecutive ? "OWNER" : "CUSTOMER",
    phone: isExecutive ? "+94 76 7171 938" : null,
    isActive: true,
  };

  return sendJson(res, 200, {
    token: `live_jwt_token_${Date.now()}`,
    user,
    authHash,
    message: "Password successfully updated! You can now sign in with your new password.",
  });
}
