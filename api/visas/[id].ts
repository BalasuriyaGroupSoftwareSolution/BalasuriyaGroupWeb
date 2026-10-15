import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import type { VisaRecord } from "./index.js";

const VISAS_FILE = "/tmp/balasuriya_visa_applications.json";

function loadVisas(): VisaRecord[] {
  try {
    if (fs.existsSync(VISAS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VISAS_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return [];
}

function saveVisas(list: VisaRecord[]): void {
  try {
    fs.writeFileSync(VISAS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  const visas = loadVisas();
  const index = visas.findIndex(
    (v) => v.id === id || v.referenceNo.toLowerCase() === String(id).toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ message: "Visa application record not found." });
  }

  if (req.method === "GET") {
    return res.status(200).json({ application: visas[index] });
  }

  if (req.method === "PATCH") {
    const data = req.body || {};
    const current = visas[index];

    // Customer editing is allowed while status is SUBMITTED, UNDER_REVIEW, or DOCS_REQUIRED
    const isLocked = current.status === "APPROVED" || current.status === "EMBASSY_PROCESSING";
    if (isLocked && !data.status) {
      return res.status(400).json({
        message: "This visa application has already been lodged with the Embassy and cannot be directly amended online.",
      });
    }

    const updated: VisaRecord = {
      ...current,
      userName: data.userName !== undefined ? String(data.userName).trim() : current.userName,
      phone: data.phone !== undefined ? String(data.phone).trim() : current.phone,
      passportNumber: data.passportNumber !== undefined ? String(data.passportNumber).toUpperCase().trim() : current.passportNumber,
      passportExpiry: data.passportExpiry !== undefined ? String(data.passportExpiry).trim() : current.passportExpiry,
      passportIssueDate: data.passportIssueDate !== undefined ? String(data.passportIssueDate).trim() : current.passportIssueDate,
      nationality: data.nationality !== undefined ? String(data.nationality).trim() : current.nationality,
      dateOfBirth: data.dateOfBirth !== undefined ? String(data.dateOfBirth).trim() : current.dateOfBirth,
      gender: data.gender !== undefined ? data.gender : current.gender,
      occupation: data.occupation !== undefined ? String(data.occupation).trim() : current.occupation,
      employerName: data.employerName !== undefined ? String(data.employerName).trim() : current.employerName,
      intendedArrivalDate: data.intendedArrivalDate !== undefined ? String(data.intendedArrivalDate).trim() : current.intendedArrivalDate,
      intendedDepartureDate: data.intendedDepartureDate !== undefined ? String(data.intendedDepartureDate).trim() : current.intendedDepartureDate,
      stayDurationDays: data.stayDurationDays !== undefined ? Number(data.stayDurationDays) : current.stayDurationDays,
      destinationAddress: data.destinationAddress !== undefined ? String(data.destinationAddress).trim() : current.destinationAddress,
      sponsorCompany: data.sponsorCompany !== undefined ? String(data.sponsorCompany).trim() : current.sponsorCompany,
      sponsorContact: data.sponsorContact !== undefined ? String(data.sponsorContact).trim() : current.sponsorContact,
      meetingPurpose: data.meetingPurpose !== undefined ? String(data.meetingPurpose).trim() : current.meetingPurpose,
      notes: data.notes !== undefined ? String(data.notes).trim() : current.notes,
      documentSummary: data.documentSummary !== undefined ? String(data.documentSummary).trim() : current.documentSummary,
      status: data.status !== undefined ? data.status : current.status,
      statusNotes: data.statusNotes !== undefined ? String(data.statusNotes).trim() : current.statusNotes,
      updatedAt: new Date().toISOString(),
    };

    visas[index] = updated;
    saveVisas(visas);

    return res.status(200).json({
      application: updated,
      message: "Visa application details updated successfully.",
    });
  }

  if (req.method === "DELETE") {
    const removed = visas.splice(index, 1)[0];
    saveVisas(visas);
    return res.status(200).json({
      message: `Visa application ${removed.referenceNo} cancelled.`,
    });
  }

  return res.status(405).json({ message: "Method not allowed." });
}
