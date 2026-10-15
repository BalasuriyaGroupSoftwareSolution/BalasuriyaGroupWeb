import { Router } from "express";
import fs from "fs";
import { sendInquiryNotificationEmail } from "../utils/mailer.js";

export const visasRouter = Router();

const VISAS_FILE = "/tmp/balasuriya_visa_applications.json";

export interface VisaRecord {
  id: string;
  referenceNo: string;
  userEmail: string;
  userName: string;
  phone: string;
  country: string;
  countryFlag: string;
  category: "TOURIST" | "BUSINESS" | "TRANSIT" | "STUDENT" | "CONFERENCE";
  visaTypeLabel: string;
  entryType: "SINGLE" | "MULTIPLE";
  passportNumber: string;
  passportExpiry: string;
  passportIssueDate?: string;
  nationality: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  occupation?: string;
  employerName?: string;
  intendedArrivalDate: string;
  intendedDepartureDate?: string;
  stayDurationDays?: number;
  destinationAddress?: string;
  sponsorCompany?: string;
  sponsorContact?: string;
  meetingPurpose?: string;
  notes?: string;
  documentSummary?: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "DOCS_REQUIRED" | "EMBASSY_PROCESSING" | "APPROVED" | "REJECTED";
  statusNotes?: string;
  submittedAt: string;
  updatedAt: string;
  canEdit?: boolean;
}

const DEFAULT_VISAS: VisaRecord[] = [
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
    intendedArrivalDate: "2026-11-20",
    intendedDepartureDate: "2026-12-05",
    stayDurationDays: 15,
    destinationAddress: "Atlantis The Royal, Palm Jumeirah, Dubai",
    status: "UNDER_REVIEW",
    statusNotes: "Preliminary documents verified. Submitting to UAE Immigration portal.",
    submittedAt: "2026-10-12T09:00:00Z",
    updatedAt: "2026-10-14T11:30:00Z",
  },
  {
    id: "visa_demo_2",
    referenceNo: "BG-VISA-2026-4409",
    userEmail: "client@balasuriyagroup.tech",
    userName: "Niluka Jayawardene",
    phone: "+94 71 987 6543",
    country: "United Kingdom (UK)",
    countryFlag: "🇬🇧",
    category: "BUSINESS",
    visaTypeLabel: "Standard Visitor Business Visa",
    entryType: "MULTIPLE",
    passportNumber: "N7612984",
    passportExpiry: "2031-04-10",
    passportIssueDate: "2021-04-11",
    nationality: "Sri Lankan",
    dateOfBirth: "1988-02-18",
    gender: "FEMALE",
    occupation: "Senior Consultant",
    employerName: "Apex FinTech Solutions",
    intendedArrivalDate: "2026-12-01",
    intendedDepartureDate: "2026-12-14",
    stayDurationDays: 14,
    destinationAddress: "Hilton London Bankside, Great Suffolk St",
    sponsorCompany: "Global Trade Partnerships UK Ltd",
    sponsorContact: "+44 20 7946 0192",
    meetingPurpose: "Annual Bilateral Trade Expo & Tech Partnership Delegation",
    status: "DOCS_REQUIRED",
    statusNotes: "Please upload the official UK Sponsor Letter signed by director before embassy submission.",
    submittedAt: "2026-10-10T14:15:00Z",
    updatedAt: "2026-10-13T10:00:00Z",
  },
];

function loadVisas(): VisaRecord[] {
  try {
    if (fs.existsSync(VISAS_FILE)) {
      const data = fs.readFileSync(VISAS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("[VISAS] Failed reading storage:", err);
  }
  return DEFAULT_VISAS;
}

function saveVisas(records: VisaRecord[]) {
  try {
    fs.writeFileSync(VISAS_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("[VISAS] Failed writing storage:", err);
  }
}

// GET /api/visas
visasRouter.get("/", (req, res) => {
  const { email } = req.query;
  const all = loadVisas();
  if (email && typeof email === "string") {
    const filtered = all.filter((v) => v.userEmail.toLowerCase() === email.toLowerCase());
    return res.json({ applications: filtered });
  }
  return res.json({ applications: all });
});

// GET /api/visas/:id
visasRouter.get("/:id", (req, res) => {
  const all = loadVisas();
  const found = all.find((v) => v.id === req.params.id || v.referenceNo === req.params.id);
  if (!found) {
    return res.status(404).json({ message: "Visa application not found." });
  }
  return res.json({ application: found });
});

// POST /api/visas
visasRouter.post("/", async (req, res) => {
  const body = req.body;
  if (!body.country || !body.passportNumber) {
    return res.status(400).json({ message: "Destination country and passport number are required." });
  }

  const all = loadVisas();
  const id = `visa_${Date.now()}`;
  const refNo = `BG-VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newApp: VisaRecord = {
    id,
    referenceNo: refNo,
    userEmail: body.userEmail || "client@balasuriyagroup.tech",
    userName: body.userName || "Client Applicant",
    phone: body.phone || "+94 77 000 0000",
    country: body.country,
    countryFlag: body.countryFlag || "🌐",
    category: body.category || "TOURIST",
    visaTypeLabel: body.visaTypeLabel || "Tourist eVisa",
    entryType: body.entryType || "SINGLE",
    passportNumber: String(body.passportNumber).toUpperCase().trim(),
    passportExpiry: body.passportExpiry || "2029-12-31",
    passportIssueDate: body.passportIssueDate || "2020-01-01",
    nationality: body.nationality || "Sri Lankan",
    dateOfBirth: body.dateOfBirth,
    gender: body.gender || "MALE",
    occupation: body.occupation,
    employerName: body.employerName,
    intendedArrivalDate: body.intendedArrivalDate || "2026-11-20",
    intendedDepartureDate: body.intendedDepartureDate,
    stayDurationDays: Number(body.stayDurationDays) || 15,
    destinationAddress: body.destinationAddress || "",
    sponsorCompany: body.sponsorCompany,
    sponsorContact: body.sponsorContact,
    meetingPurpose: body.meetingPurpose,
    notes: body.notes || "",
    documentSummary: body.documentSummary || "Passport bio-page + Digital Photo",
    status: "SUBMITTED",
    statusNotes: "Application received and queued for officer verification. Details remain editable by applicant.",
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(newApp);
  saveVisas(all);

  // Notify balasuriyagroup.info@gmail.com asynchronously
  sendInquiryNotificationEmail({
    division: "VISA",
    name: newApp.userName,
    email: newApp.userEmail,
    phone: newApp.phone,
    subject: `New Online Visa Application [${refNo}]: ${newApp.country} (${newApp.userName})`,
    message: `Reference: ${refNo}\nCountry: ${newApp.country}\nCategory: ${newApp.category}\nPassport No: ${newApp.passportNumber} (Expiry: ${newApp.passportExpiry})\nArrival: ${newApp.intendedArrivalDate}\nStay: ${newApp.stayDurationDays} Days\nSponsor/Stay: ${newApp.destinationAddress || newApp.sponsorCompany || "N/A"}\nNotes: ${newApp.notes || "None"}`,
    referenceId: refNo,
    details: {
      referenceNo: refNo,
      country: newApp.country,
      category: newApp.category,
      passportNumber: newApp.passportNumber,
      intendedArrivalDate: newApp.intendedArrivalDate,
    },
  }).catch((err) => console.error("[VISAS] Mail notification error:", err));

  return res.status(201).json({
    success: true,
    application: newApp,
    message: "Visa application submitted successfully.",
  });
});

// PATCH /api/visas/:id
visasRouter.patch("/:id", (req, res) => {
  const all = loadVisas();
  const idx = all.findIndex((v) => v.id === req.params.id || v.referenceNo === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: "Visa application not found." });
  }

  const existing = all[idx];
  const body = req.body;

  const updated: VisaRecord = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updated;
  saveVisas(all);

  return res.json({
    success: true,
    application: updated,
    message: "Visa application updated successfully.",
  });
});

// DELETE /api/visas/:id
visasRouter.delete("/:id", (req, res) => {
  const all = loadVisas();
  const filtered = all.filter((v) => v.id !== req.params.id && v.referenceNo !== req.params.id);
  saveVisas(filtered);
  return res.json({ success: true, message: "Visa application removed." });
});
