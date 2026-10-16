import type { VercelRequest, VercelResponse } from "../_types.js";
import fs from "fs";

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

function loadVisas(): VisaRecord[] {
  try {
    if (fs.existsSync(VISAS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VISAS_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_VISAS;
}

function saveVisas(list: VisaRecord[]): void {
  try {
    fs.writeFileSync(VISAS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const visas = loadVisas();

  if (req.method === "GET") {
    const { email } = req.query;
    if (email) {
      const filtered = visas.filter(
        (v) => v.userEmail.toLowerCase().trim() === String(email).toLowerCase().trim()
      );
      return res.status(200).json({ applications: filtered });
    }
    return res.status(200).json({ applications: visas });
  }

  if (req.method === "POST") {
    const data = req.body || {};
    if (!data.country || !data.category || !data.passportNumber || !data.intendedArrivalDate) {
      return res.status(400).json({
        message: "Country, visa category, passport number, and travel arrival date are required.",
      });
    }

    const newApp: VisaRecord = {
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

    return res.status(201).json({
      application: newApp,
      message: `Online visa application lodged successfully. Tracking Ref: ${newApp.referenceNo}`,
    });
  }

  if (req.method === "PATCH") {
    const data = req.body || {};
    const id = (req.query?.id as string) || data.id;
    const index = visas.findIndex((v) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Visa application not found." });
    }
    const updated = { ...visas[index], ...data, updatedAt: new Date().toISOString() };
    visas[index] = updated;
    saveVisas(visas);
    return res.status(200).json({ application: updated, message: "Visa application updated successfully." });
  }

  return res.status(405).json({ message: "Method not allowed." });
}
