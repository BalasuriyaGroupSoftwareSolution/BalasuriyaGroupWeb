import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

/**
 * JWT secret. In production it MUST come from the environment (Vercel →
 * Settings → Environment Variables). There is deliberately no hard-coded
 * fallback: a secret written in the source code is public to anyone who can
 * read the repo, and lets them mint OWNER tokens.
 */
function jwtSecret(): string {
  const value = process.env.JWT_SECRET?.trim() ?? "";
  if (value.length >= 32) return value;
  if (!isProduction) {
    // Local development only — never used on the live site.
    return "local-dev-only-secret-not-for-production-use-0000";
  }
  throw new Error(
    "JWT_SECRET is missing or shorter than 32 characters. Set it in Vercel → Project → Settings → Environment Variables."
  );
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  get jwtSecret() {
    return jwtSecret();
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cors: {
    allowedOrigins: (
      process.env.CORS_ALLOWED_ORIGINS ??
      "https://balasuriyagroup.tech,https://www.balasuriyagroup.tech,http://localhost:5173"
    )
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
  },
  /** Public site URL used in emailed links. */
  siteUrl: (process.env.SITE_URL ?? "https://www.balasuriyagroup.tech").replace(/\/$/, ""),
};

/** Non-secret summary used by /api/health so you can see what is configured. */
export function configStatus() {
  let jwtOk = true;
  try {
    jwtSecret();
  } catch {
    jwtOk = false;
  }
  return {
    database: Boolean(process.env.DATABASE_URL),
    jwtSecret: jwtOk,
    email: Boolean(process.env.RESEND_API_KEY),
    googleLogin: Boolean(process.env.GOOGLE_CLIENT_ID),
  };
}
