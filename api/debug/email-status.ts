import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: "No RESEND_API_KEY" });
  }

  const emailId = (req.query.id as string) || "01a13d5d-0533-78f0-a62f-63917fd50383";

  try {
    const statusRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
      },
    });

    const data = await statusRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
