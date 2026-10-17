import crypto from "crypto";
const HMAC_SECRET = process.env.JWT_SECRET || process.env.RESEND_API_KEY || "balasuriya_secure_otp_key_2026";
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
    if (req.body && typeof req.body === "object")
        return req.body;
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        }
        catch { }
    }
    return new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk; });
        req.on("end", () => {
            try {
                resolve(JSON.parse(raw));
            }
            catch {
                resolve({});
            }
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
    const bodyData = await getBody(req);
    const { name, email, password, phone } = bodyData || {};
    if (!name || !email || !password) {
        return sendJson(res, 400, { message: "Name, email and password are required." });
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
    const body = Buffer.from(JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    })).toString("base64url");
    const signature = crypto.createHmac("sha256", HMAC_SECRET).update(`${header}.${body}`).digest("base64url");
    const passwordHash = crypto.pbkdf2Sync(String(password), HMAC_SECRET, 10000, 64, "sha512").toString("hex");
    try {
        const os = await import("os");
        const path = await import("path");
        const fs = await import("fs");
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
                all[normalized] = {
                    id: user.id,
                    name: user.name,
                    email: normalized,
                    role: user.role,
                    phone: user.phone,
                    passwordHash,
                    createdAt: Date.now(),
                };
                fs.writeFileSync(acFile, JSON.stringify(all, null, 2), "utf-8");
                break;
            } catch {}
        }
    } catch {}

    return sendJson(res, 201, {
        token,
        user,
        message: "Registration successful. Welcome to Balasuriya Group!",
    });
}
