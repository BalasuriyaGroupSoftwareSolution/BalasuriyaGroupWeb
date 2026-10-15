import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";

const INQUIRIES_FILE = "/tmp/balasuriya_inquiries.json";
const TARGET_NOTIFICATION_EMAIL = "balasuriyagroup.info@gmail.com";
const VERIFIED_FROM_EMAIL = process.env.FROM_EMAIL || "Balasuriya Group <security@balasuriyagroup.tech>";
const SANDBOX_FROM_EMAIL = "Balasuriya Group <onboarding@resend.dev>";

export interface InquiryRecord {
  id: string;
  division: "VISA" | "AIR_TICKETING" | "CONSTRUCTION" | "TOURISM" | "SOFTWARE" | "GENERAL";
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  details?: Record<string, any>;
  createdAt: string;
}

function loadInquiries(): InquiryRecord[] {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[INQUIRIES] Failed reading file:", err);
  }
  return [];
}

function saveInquiries(inquiries: InquiryRecord[]) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("[INQUIRIES] Failed writing file:", err);
  }
}

async function sendNotificationEmail(inquiry: InquiryRecord): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[INQUIRIES] No RESEND_API_KEY configured. Notification for inquiry ${inquiry.id} logged.`);
    return { success: true };
  }

  const timeTag = new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
  const divisionLabel = inquiry.division.replace(/_/g, " ");

  const customDetailsHtml = inquiry.details
    ? Object.entries(inquiry.details)
        .filter(([_, val]) => val !== undefined && val !== null && val !== "")
        .map(
          ([key, val]) => `
            <tr>
              <td style="padding: 6px 12px; font-weight: bold; color: #475569; text-transform: capitalize; border-bottom: 1px solid #f1f5f9; width: 35%;">
                ${key.replace(/([A-Z])/g, " $1")}
              </td>
              <td style="padding: 6px 12px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                ${typeof val === "object" ? JSON.stringify(val) : String(val)}
              </td>
            </tr>
          `
        )
        .join("")
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #0B1E3F; padding: 24px 32px; border-bottom: 3px solid #D4AF37;">
          <div style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            ${divisionLabel} DIVISION &bull; NEW ENQUIRY
          </div>
          <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 6px 0 0 0;">
            ${inquiry.subject}
          </h1>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">
            Reference ID: <strong>${inquiry.id}</strong> &bull; Received: ${timeTag}
          </div>
        </div>

        <div style="padding: 30px 32px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
              Contact Information
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${inquiry.name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Email:</td>
                <td style="padding: 4px 0;"><a href="mailto:${inquiry.email}" style="color: #1e3a8a; text-decoration: none; font-weight: 600;">${inquiry.email}</a></td>
              </tr>
              ${
                inquiry.phone
                  ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Phone / WhatsApp:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">
                  <a href="tel:${inquiry.phone.replace(/\s/g, "")}" style="color: #0f172a; text-decoration: none;">${inquiry.phone}</a>
                  &nbsp;
                  <a href="https://wa.me/${inquiry.phone.replace(/[^0-9]/g, "")}" style="color: #16a34a; font-size: 12px; font-weight: bold; text-decoration: none;">(Open WhatsApp)</a>
                </td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
              Message / Requirements
            </h3>
            <div style="background-color: #ffffff; border-left: 4px solid #0B1E3F; padding: 14px 18px; font-size: 14px; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; border-radius: 4px;">
              ${inquiry.message.replace(/\n/g, "<br/>")}
            </div>
          </div>

          ${
            customDetailsHtml
              ? `
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
              Specific Details Submitted
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              ${customDetailsHtml}
            </table>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 32px;">
            <a href="mailto:${inquiry.email}?subject=RE: ${encodeURIComponent(inquiry.subject)}" style="background-color: #0B1E3F; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
              Reply Directly to ${inquiry.name}
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
          Balasuriya Group Portal Notification &bull; Delivered to ${TARGET_NOTIFICATION_EMAIL}
        </div>
      </div>
    </body>
    </html>
  `;

  const fromOptions = [VERIFIED_FROM_EMAIL, SANDBOX_FROM_EMAIL];

  for (const fromAddr of fromOptions) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [TARGET_NOTIFICATION_EMAIL],
          reply_to: inquiry.email,
          subject: `[${divisionLabel}] Inquiry from ${inquiry.name}: ${inquiry.subject}`,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[INQUIRIES] Successfully notified ${TARGET_NOTIFICATION_EMAIL} via ${fromAddr}`);
        return { success: true };
      } else {
        const errorText = await res.text();
        console.warn(`[INQUIRIES] Resend response with ${fromAddr}: ${errorText}`);
      }
    } catch (err: any) {
      console.error(`[INQUIRIES] Failed dispatching with ${fromAddr}:`, err);
    }
  }

  return { success: false, error: "Failed to dispatch email notification via Resend." };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const inquiries = loadInquiries();
    return res.status(200).json({ inquiries });
  }

  if (req.method === "POST") {
    const { division = "GENERAL", name, email, phone, subject, message, details } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }

    const id = `BG-INQ-${Date.now().toString().slice(-6)}`;
    const newInquiry: InquiryRecord = {
      id,
      division: division.toUpperCase(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject ? String(subject).trim() : `General Inquiry from ${name}`,
      message: String(message).trim(),
      details,
      createdAt: new Date().toISOString(),
    };

    const inquiries = loadInquiries();
    inquiries.unshift(newInquiry);
    saveInquiries(inquiries.slice(0, 200));

    // Send email notification to balasuriyagroup.info@gmail.com
    await sendNotificationEmail(newInquiry);

    return res.status(201).json({
      success: true,
      referenceId: id,
      message: `Thank you! Your inquiry has been dispatched to ${TARGET_NOTIFICATION_EMAIL}. Our team will contact you shortly.`,
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
