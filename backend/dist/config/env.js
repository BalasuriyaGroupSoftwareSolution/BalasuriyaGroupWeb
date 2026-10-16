import "dotenv/config";
function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: process.env.DATABASE_URL ?? "",
    jwt: {
        secret: process.env.JWT_SECRET ?? "balasuriya-group-default-jwt-secret-key-2026",
        expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    },
    cors: {
        // Comma-separated list, e.g. "https://balasuriyagroup.tech,http://localhost:5173"
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean),
    },
    google: {
        // OAuth Client ID for this app — required to validate the "aud" claim on
        // Google ID tokens. Without it, Google login is refused (fail closed).
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    },
};
//# sourceMappingURL=env.js.map