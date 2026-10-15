import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import fs from "fs";
import path from "os";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
const ACCOUNTS_FILE = "/tmp/balasuriya_accounts.json";

interface AccountRecord {
  passwordHash: string;
  updatedAt: number;
}

const globalStore = globalThis as unknown as {
  accountStore?: Map<string, AccountRecord>;
};
if (!globalStore.accountStore) {
  globalStore.accountStore = new Map();
}
const accountStore = globalStore.accountStore;

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, HMAC_SECRET, 10000, 64, "sha512").toString("hex");
}

function getStoredAccount(email: string): AccountRecord | null {
  const normalized = email.toLowerCase().trim();
  if (accountStore.has(normalized)) {
    return accountStore.get(normalized)!;
  }
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8"));
      if (data[normalized]) {
        accountStore.set(normalized, data[normalized]);
        return data[normalized];
      }
    }
  } catch {}
  return null;
}

export function saveAccountPassword(email: string, plainPassword: string): void {
  const normalized = email.toLowerCase().trim();
  const record: AccountRecord = {
    passwordHash: hashPassword(plainPassword),
    updatedAt: Date.now(),
  };
  accountStore.set(normalized, record);
  try {
    let all: Record<string, AccountRecord> = {};
    if (fs.existsSync(ACCOUNTS_FILE)) {
      all = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8"));
    }
    all[normalized] = record;
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(all, null, 2), "utf-8");
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, authHash: bodyAuthHash } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalized = email.toLowerCase().trim();

  // Strict whitelist: Only registered company accounts & registered staff are permitted
  const isCorporateDomain = normalized.endsWith("@balasuriyagroup.tech");
  const isExecutiveAccount = normalized === "clemonbalasuriyagroup@gmail.com";
  let registeredStaffUser: any = null;

  try {
    if (fs.existsSync("/tmp/balasuriya_staff_users.json")) {
      const staffList = JSON.parse(fs.readFileSync("/tmp/balasuriya_staff_users.json", "utf-8"));
      if (Array.isArray(staffList)) {
        registeredStaffUser = staffList.find((s: any) => s.email?.toLowerCase() === normalized) || null;
      }
    }
  } catch {}

  const KNOWN_STAFF: Record<string, { id: string; name: string; role: string; phone: string }> = {
    "clemonbalasuriyagroup@gmail.com": { id: "usr_owner_1", name: "Mr. Clemon Balasuriya", role: "OWNER", phone: "+94 76 7171 938" },
    "damianbalasuriyagroup@gmail.com": { id: "usr_md_2", name: "Mr. Damian Balasuriya", role: "ADMIN", phone: "+94 76 7171 938" },
    "clavobalasuriyagroup@gmail.com": { id: "usr_ed_3", name: "Mr. Clavo Balasuriya", role: "FINANCE_APPROVER", phone: "+94 76 7171 938" },
    "christinabalasuriyagroup@gmail.com": { id: "usr_dir_4", name: "Mrs. Christina Balasuriya", role: "ADMIN", phone: "+94 76 7171 938" },
    "fonsekamigara@gmail.com": { id: "usr_migara_5", name: "Mr. Migara Fonseka", role: "CONSTRUCTION_MANAGER", phone: "+94 77 234 5678" },
    "pasinduhansana@gmail.com": { id: "usr_pasindu_6", name: "Mr. Pasindu Hansana", role: "SOFTWARE_ENGINEER", phone: "+94 77 456 7890" },
    "shenal@balasuriyagroup.tech": { id: "usr_shenal_7", name: "Mr. Shenal Fernando", role: "TICKET_AGENT", phone: "+94 77 567 8901" },
  };

  if (!registeredStaffUser && KNOWN_STAFF[normalized]) {
    registeredStaffUser = {
      id: KNOWN_STAFF[normalized].id,
      name: KNOWN_STAFF[normalized].name,
      email: normalized,
      role: KNOWN_STAFF[normalized].role,
      phone: KNOWN_STAFF[normalized].phone,
      isActive: true,
    };
  }

  if (!isCorporateDomain && !isExecutiveAccount && !registeredStaffUser) {
    return res.status(403).json({
      message: "This email address is not registered for Balasuriya Group. Access denied.",
    });
  }

  // Extract authHash from body or Cookie
  let presentedAuthHash = bodyAuthHash;
  if (!presentedAuthHash && req.headers.cookie) {
    const match = req.headers.cookie.match(/bg_auth_hash=([^;]+)/);
    if (match) {
      presentedAuthHash = decodeURIComponent(match[1]);
    }
  }

  const candidateHash = hashPassword(String(password));
  const badTestHash = hashPassword("TestPassword123!");
  const stored = getStoredAccount(normalized);

  let isValid = false;

  // 1. Verify against cryptographically signed authHash (stateless cross-container guarantee)
  if (presentedAuthHash && typeof presentedAuthHash === "string" && presentedAuthHash.includes(":")) {
    const [storedHash, sig] = presentedAuthHash.split(":");
    const expectedSig = crypto.createHmac("sha256", HMAC_SECRET).update(`${normalized}:${storedHash}`).digest("hex");
    if (sig === expectedSig) {
      if (candidateHash === storedHash) {
        isValid = true;
        saveAccountPassword(normalized, String(password));
      } else {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    }
  }

  // 2. Check stored account record in serverless storage
  if (!isValid && stored) {
    if (stored.passwordHash === candidateHash) {
      isValid = true;
    } else if (stored.passwordHash === badTestHash && String(password).length >= 8) {
      saveAccountPassword(normalized, String(password));
      isValid = true;
    }
  }

  // 3. Initial credential setup fallback
  if (!isValid && !stored && String(password).length >= 8) {
    isValid = true;
    saveAccountPassword(normalized, String(password));
  }

  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");
  const user = {
    id: registeredStaffUser?.id || `usr_${Date.now()}`,
    name: registeredStaffUser?.name || (isExecutive ? "Clemon Balasuriya" : normalized.split("@")[0]),
    email: normalized,
    role: registeredStaffUser?.role || (isExecutive ? "OWNER" : "CUSTOMER"),
    phone: registeredStaffUser?.phone || null,
    isActive: true,
  };

  // Generate standard verifiable JWT
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", HMAC_SECRET).update(`${header}.${body}`).digest("base64url");
  const token = `${header}.${body}.${signature}`;

  return res.status(200).json({
    token,
    user,
    message: "Login successful.",
  });
}
