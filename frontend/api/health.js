export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

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
