import crypto from "crypto";

const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password, phone } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  const normalized = email.toLowerCase().trim();
  const isExecutive = normalized.includes("clemon") || normalized.includes("balasuriya");

  const user = {
    id: `usr_${Date.now()}`,
    name: String(name).trim(),
    email: normalized,
    role: isExecutive ? "OWNER" : "CUSTOMER",
    phone: phone ? String(phone).trim() : null,
    isActive: true,
  };

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

  return res.status(201).json({
    token,
    user,
    message: "Registration successful. Welcome to Balasuriya Group!",
  });
}
