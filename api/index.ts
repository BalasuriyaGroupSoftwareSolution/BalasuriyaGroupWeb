import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../backend/dist/app.js";

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Restore original request path if rewritten to /api by Vercel
  const matchedPath =
    (req.headers["x-matched-path"] as string) ||
    (req.headers["x-forwarded-uri"] as string) ||
    (req.headers["x-original-url"] as string);

  if (matchedPath && matchedPath !== "/api" && matchedPath !== "/api/") {
    req.url = matchedPath;
  } else if (req.url === "/api" || req.url === "/api/" || req.url === "/") {
    const rawUrl = req.headers["x-now-route-matches"] as string;
    if (rawUrl) {
      try {
        const params = new URLSearchParams(rawUrl);
        const sub = params.get("1") || params.get("0");
        if (sub) {
          req.url = `/api/${sub.replace(/^\//, "")}`;
        }
      } catch {
        // ignore
      }
    }
  }

  return (app as any)(req, res);
}
