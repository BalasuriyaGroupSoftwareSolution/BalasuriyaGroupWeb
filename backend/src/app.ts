import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, configStatus } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.routes.js";
import { constructionRouter } from "./routes/construction.routes.js";
import { tourismRouter } from "./routes/tourism.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { inquiriesRouter } from "./routes/inquiries.routes.js";
import { visasRouter } from "./routes/visas.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet());
  // The site and API share one domain on Vercel, so browsers don't need CORS at
  // all. Only the listed origins (e.g. local dev on :5173) may call cross-origin.
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.cors.allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
    })
  );
  app.use(express.json({ limit: "1mb" }));
  // API responses carry personal data; never let a shared cache keep them.
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // Health check: open https://<your-site>/api/health to see whether the
  // database and settings are wired up. Shows yes/no only, never secret values.
  const health = async (_req: express.Request, res: express.Response) => {
    const config = configStatus();
    let databaseReachable = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
    } catch (err: any) {
      console.error("[health] database check failed:", err?.message);
    }
    const ok = databaseReachable && config.jwtSecret;
    res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "degraded", databaseReachable, config });
  };
  app.get("/health", health);
  app.get("/api/health", health);
  app.get("/api", (_req, res) => res.json({ status: "ok", service: "Balasuriya Group API" }));

  app.use("/api/auth", authRouter);
  app.use("/auth", authRouter);

  app.use("/api/construction", constructionRouter);
  app.use("/construction", constructionRouter);

  app.use("/api/tourism", tourismRouter);
  app.use("/tourism", tourismRouter);

  app.use("/api/payments", paymentsRouter);
  app.use("/payments", paymentsRouter);

  app.use("/api/users", usersRouter);
  app.use("/users", usersRouter);

  app.use("/api/inquiries", inquiriesRouter);
  app.use("/inquiries", inquiriesRouter);

  app.use("/api/visas", visasRouter);
  app.use("/visas", visasRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
