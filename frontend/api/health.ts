import type { VercelRequest, VercelResponse } from "./_types.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    status: "ok",
    hasDb: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString()
  });
}
