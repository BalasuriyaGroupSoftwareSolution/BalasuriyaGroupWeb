export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const data = {
    status: "ok",
    hasDb: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString(),
  };
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(200).json(data);
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}
