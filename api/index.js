import { createApp } from "../backend/dist/app.js";

let appInstance = null;

function getApp() {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  // Handle URL matching in Vercel serverless environment
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.headers["x-original-url"];
  if (matchedPath && !matchedPath.startsWith("/api/index")) {
    const qIndex = req.url ? req.url.indexOf("?") : -1;
    const query = qIndex !== -1 ? req.url.slice(qIndex) : "";
    req.url = matchedPath.includes("?") ? matchedPath : `${matchedPath}${query}`;
  }

  const app = getApp();
  return app(req, res);
}
