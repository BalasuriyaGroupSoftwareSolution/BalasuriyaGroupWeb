import fs from "fs";
const VISAS_FILE = "/tmp/balasuriya_visa_applications.json";
const DEFAULT_VISAS = [
    {
        id: "visa_demo_1",
        referenceNo: "BG-VISA-2026-8812",
        userEmail: "client@balasuriyagroup.tech",
        userName: "Deshamanya Rohan De Silva",
        phone: "+94 77 123 4567",
        country: "United Arab Emirates (Dubai)",
        countryFlag: "🇦🇪",
        category: "TOURIST",
        visaTypeLabel: "30-Day Express Tourist eVisa",
        entryType: "SINGLE",
        passportNumber: "N8921456",
        passportExpiry: "2029-11-20",
        passportIssueDate: "2019-11-21",
        nationality: "Sri Lankan",
        dateOfBirth: "1984-06-14",
        gender: "MALE",
        occupation: "Managing Director",
        employerName: "De Silva Logistics Ltd",
        intendedArrivalDate: "2026-11-10",
        intendedDepartureDate: "2026-11-24",
        stayDurationDays: 14,
        destinationAddress: "Grand Hyatt Hotel, Dubai Creek, UAE",
        notes: "Family leisure visit & Dubai Expo tour. White background photo and confirmed return air ticket uploaded.",
        documentSummary: "Passport Bio-page + White BG Photo + CMB-DXB Confirmed Ticket",
        status: "UNDER_REVIEW",
        statusNotes: "Documents verified by Balasuriya Visa Desk. Ready for General Directorate of Residency (GDRFA) submission.",
        submittedAt: "2026-10-12T09:30:00.000Z",
        updatedAt: "2026-10-14T11:20:00.000Z",
        canEdit: true,
    },
    {
        id: "visa_demo_2",
        referenceNo: "BG-VISA-2026-9403",
        userEmail: "client@balasuriyagroup.tech",
        userName: "Deshamanya Rohan De Silva",
        phone: "+94 77 123 4567",
        country: "India",
        countryFlag: "🇮🇳",
        category: "BUSINESS",
        visaTypeLabel: "Double Entry Business e-Visa",
        entryType: "MULTIPLE",
        passportNumber: "N8921456",
        passportExpiry: "2029-11-20",
        nationality: "Sri Lankan",
        dateOfBirth: "1984-06-14",
        occupation: "Managing Director",
        intendedArrivalDate: "2026-12-05",
        intendedDepartureDate: "2026-12-18",
        stayDurationDays: 13,
        status: "SUBMITTED",
        statusNotes: "Application lodged online. Initial compliance check scheduled by Head of Visa Services.",
        submittedAt: "2026-10-15T08:00:00.000Z",
        updatedAt: "2026-10-15T08:00:00.000Z",
        canEdit: true,
    },
];
function loadVisas() {
    try {
        if (fs.existsSync(VISAS_FILE)) {
            const data = JSON.parse(fs.readFileSync(VISAS_FILE, "utf-8"));
            if (Array.isArray(data) && data.length > 0)
                return data;
        }
    }
    catch { }
    return DEFAULT_VISAS;
}

function saveVisas(list) {
    try {
        fs.writeFileSync(VISAS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
    catch { }
}

const TARGET_NOTIFICATION_EMAIL = "balasuriyagroup.info@gmail.com";
const VERIFIED_FROM_EMAIL = "Balasuriya Group Visas <visas@balasuriyagroup.tech>";
const SANDBOX_FROM_EMAIL = "onboarding@resend.dev";

function getResendApiKey() {
    if (process.env.RESEND_API_KEY)
        return process.env.RESEND_API_KEY.trim();
    try {
        for (const p of [".env", "backend/.env", "../backend/.env"]) {
            if (fs.existsSync(p)) {
                const text = fs.readFileSync(p, "utf-8");
                const m = text.match(/RESEND_API_KEY\s*=\s*([^\r\n]+)/);
                if (m && m[1])
                    return m[1].trim();
            }
        }
    }
    catch { }
    return "";
}

async function sendVisaNotificationEmail(visa) {
    const resendApiKey = getResendApiKey();
    if (!resendApiKey)
        return;
    const timeTag = new Date(visa.submittedAt).toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #0B1E3F; padding: 24px 32px; border-bottom: 3px solid #D4AF37;">
          <div style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            GLOBAL VISA DIVISION &bull; NEW APPLICATION
          </div>
          <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 6px 0 0 0;">
            ${visa.countryFlag} ${visa.country} — ${visa.visaTypeLabel}
          </h1>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">
            Reference: <strong>${visa.referenceNo}</strong> &bull; Received: ${timeTag}
          </div>
        </div>
        <div style="padding: 30px 32px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
              Applicant & Travel Details
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 140px;">Applicant Name:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${visa.userName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Email:</td>
                <td style="padding: 4px 0;"><a href="mailto:${visa.userEmail}" style="color: #1e3a8a; text-decoration: none; font-weight: 600;">${visa.userEmail}</a></td>
              </tr>
              ${visa.phone ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Phone / WhatsApp:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;"><a href="tel:${visa.phone.replace(/\s/g, "")}" style="color: #0f172a; text-decoration: none;">${visa.phone}</a></td>
              </tr>` : ""}
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Country / Visa:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${visa.country} (${visa.category})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Passport No:</td>
                <td style="padding: 4px 0; color: #0f172a; font-mono font-bold;">${visa.passportNumber} (Exp: ${visa.passportExpiry || "N/A"})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Target Arrival Date:</td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${visa.intendedArrivalDate}</td>
              </tr>
              ${visa.notes ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Notes / Purpose:</td>
                <td style="padding: 4px 0; color: #0f172a;">${visa.notes}</td>
              </tr>` : ""}
            </table>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="mailto:${visa.userEmail}?subject=Regarding Your Visa Application ${visa.referenceNo}" style="background-color: #0B1E3F; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
              Reply Directly to Applicant
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
          Balasuriya Group Global Visa System &bull; Delivered to ${TARGET_NOTIFICATION_EMAIL}
        </div>
      </div>
    </body>
    </html>
    `;
    for (const fromAddr of [VERIFIED_FROM_EMAIL, SANDBOX_FROM_EMAIL]) {
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
                    reply_to: visa.userEmail,
                    subject: `[VISA APPLICATION] ${visa.countryFlag} ${visa.country} (${visa.category}) - ${visa.userName} [${visa.referenceNo}]`,
                    html,
                }),
            });
            if (res.ok) {
                break;
            }
        }
        catch { }
    }
}

function sendJson(res, status, data) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (typeof res.status === "function" && typeof res.json === "function") {
        return res.status(status).json(data);
    }
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(data));
}
async function getBody(req) {
    if (req.body && typeof req.body === "object")
        return req.body;
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        }
        catch { }
    }
    return new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk; });
        req.on("end", () => {
            try {
                resolve(JSON.parse(raw));
            }
            catch {
                resolve({});
            }
        });
        req.on("error", () => resolve({}));
    });
}
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        return res.end();
    }
    const visas = loadVisas();
    if (req.method === "GET") {
        const email = req.query?.email;
        if (email) {
            const filtered = visas.filter((v) => v.userEmail.toLowerCase().trim() === String(email).toLowerCase().trim());
            return sendJson(res, 200, { applications: filtered });
        }
        return sendJson(res, 200, { applications: visas });
    }
    if (req.method === "POST") {
        const data = (await getBody(req)) || {};
        if (!data.country || !data.category || !data.passportNumber || !data.intendedArrivalDate) {
            return sendJson(res, 400, {
                message: "Country, visa category, passport number, and travel arrival date are required.",
            });
        }
        const newApp = {
            id: `visa_${Date.now()}`,
            referenceNo: `BG-VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            userEmail: String(data.userEmail || "guest@balasuriyagroup.tech").toLowerCase().trim(),
            userName: String(data.userName || "Applicant").trim(),
            phone: String(data.phone || "").trim(),
            country: String(data.country).trim(),
            countryFlag: String(data.countryFlag || "🌐"),
            category: data.category,
            visaTypeLabel: String(data.visaTypeLabel || `${data.category} eVisa`).trim(),
            entryType: data.entryType === "MULTIPLE" ? "MULTIPLE" : "SINGLE",
            passportNumber: String(data.passportNumber).toUpperCase().trim(),
            passportExpiry: String(data.passportExpiry || "").trim(),
            passportIssueDate: data.passportIssueDate ? String(data.passportIssueDate).trim() : undefined,
            nationality: String(data.nationality || "Sri Lankan").trim(),
            dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).trim() : undefined,
            gender: data.gender || "MALE",
            occupation: data.occupation ? String(data.occupation).trim() : undefined,
            employerName: data.employerName ? String(data.employerName).trim() : undefined,
            intendedArrivalDate: String(data.intendedArrivalDate).trim(),
            intendedDepartureDate: data.intendedDepartureDate ? String(data.intendedDepartureDate).trim() : undefined,
            stayDurationDays: data.stayDurationDays ? Number(data.stayDurationDays) : undefined,
            destinationAddress: data.destinationAddress ? String(data.destinationAddress).trim() : undefined,
            sponsorCompany: data.sponsorCompany ? String(data.sponsorCompany).trim() : undefined,
            sponsorContact: data.sponsorContact ? String(data.sponsorContact).trim() : undefined,
            meetingPurpose: data.meetingPurpose ? String(data.meetingPurpose).trim() : undefined,
            notes: data.notes ? String(data.notes).trim() : undefined,
            documentSummary: data.documentSummary ? String(data.documentSummary).trim() : "Passport + Bio-Data uploaded",
            status: "SUBMITTED",
            statusNotes: "Application lodged successfully. Under review by Balasuriya Group Visa Division.",
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            canEdit: true,
        };
        visas.unshift(newApp);
        saveVisas(visas);
        try {
            await sendVisaNotificationEmail(newApp);
        } catch {}
        return sendJson(res, 201, {
            application: newApp,
            message: `Online visa application lodged successfully. Tracking Ref: ${newApp.referenceNo}`,
        });
    }
    if (req.method === "PATCH") {
        const data = (await getBody(req)) || {};
        const id = req.query?.id || data.id;
        const index = visas.findIndex((v) => v.id === id);
        if (index === -1) {
            return sendJson(res, 404, { message: "Visa application not found." });
        }
        const updated = { ...visas[index], ...data, updatedAt: new Date().toISOString() };
        visas[index] = updated;
        saveVisas(visas);
        return sendJson(res, 200, { application: updated, message: "Visa application updated successfully." });
    }
    return sendJson(res, 405, { message: "Method not allowed." });
}
