import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { constructionRouter } from "./routes/construction.routes.js";
import { tourismRouter } from "./routes/tourism.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { inquiriesRouter } from "./routes/inquiries.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
