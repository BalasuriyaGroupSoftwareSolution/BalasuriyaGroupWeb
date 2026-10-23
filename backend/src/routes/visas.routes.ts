import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { authenticate, userRoles } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { sendInquiryNotificationEmail } from "../utils/mailer.js";

export const visasRouter = Router();

/** Staff who handle visas. They see and update every application. */
const VISA_STAFF = ["OWNER", "ADMIN", "TOURISM_AGENT", "TOURISM_STAFF", "TICKET_AGENT", "TICKET_STAFF"];
const isVisaStaff = (u: Express.Request["user"]) => userRoles(u).some((r) => VISA_STAFF.includes(r));

/** Applicants may only edit while the application is still with us. */
const APPLICANT_EDITABLE = new Set(["SUBMITTED", "DOCS_REQUIRED"]);

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { message: "Too many applications from this connection. Please try again later." },
});

const str = (max = 200) => z.string().trim().max(max).optional().nullable();

// Fields an applicant fills in. Status fields are deliberately absent.
const applicantFields = z.object({
  userName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(25),
  country: z.string().trim().min(2).max(120),
  countryFlag: str(16),
  category: z.enum(["TOURIST", "BUSINESS", "TRANSIT", "STUDENT", "CONFERENCE"]),
  visaTypeLabel: str(),
  entryType: z.enum(["SINGLE", "MULTIPLE"]).default("SINGLE"),
  passportNumber: z.string().trim().min(5).max(20).transform((s) => s.toUpperCase()),
  passportExpiry: str(20),
  passportIssueDate: str(20),
  nationality: str(80),
  dateOfBirth: str(20),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  occupation: str(),
  employerName: str(),
  intendedArrivalDate: str(20),
  intendedDepartureDate: str(20),
  stayDurationDays: z.coerce.number().int().min(1).max(3650).optional().nullable(),
  destinationAddress: str(400),
  sponsorCompany: str(),
  sponsorContact: str(),
  meetingPurpose: str(1000),
  notes: str(2000),
  documentSummary: str(1000),
});

const createSchema = applicantFields.extend({ userEmail: z.string().email().optional() });

/** Strip unknown keys a client may send (id, status, submittedAt…). */
function toRecord(app: any) {
  return {
    ...app,
    submittedAt: app.submittedAt instanceof Date ? app.submittedAt.toISOString() : app.submittedAt,
    updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : app.updatedAt,
    canEdit: APPLICANT_EDITABLE.has(app.status),
  };
}

async function findOwned(req: Express.Request, idOrRef: string) {
  const app = await prisma.visaApplication.findFirst({
    where: { OR: [{ id: idOrRef }, { referenceNo: idOrRef }] },
  });
  if (!app) throw new HttpError(404, "Visa application not found.");
  const user = req.user!;
  const owns = app.userId === user.id || app.userEmail === user.email.toLowerCase();
  if (!owns && !isVisaStaff(user)) throw new HttpError(404, "Visa application not found.");
  return { app, owns };
}

function newReference() {
  return `BG-VISA-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
}

// All visa routes require a signed-in user: these records hold passport data.
visasRouter.use(authenticate);

// Applicant: own applications. Visa staff: everything (optionally ?status=).
visasRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const staff = isVisaStaff(user);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const apps = await prisma.visaApplication.findMany({
      where: staff
        ? status
          ? { status: status as any }
          : undefined
        : { OR: [{ userId: user.id }, { userEmail: user.email.toLowerCase() }] },
      orderBy: { submittedAt: "desc" },
    });
    res.json({ applications: apps.map(toRecord) });
  })
);

visasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { app } = await findOwned(req, req.params.id);
    res.json({ application: toRecord(app) });
  })
);

visasRouter.post(
  "/",
  submitLimiter,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const data = createSchema.parse(req.body);
    // Customers always file under their own email; staff may file on a customer's behalf.
    const userEmail = (isVisaStaff(user) && data.userEmail ? data.userEmail : user.email).toLowerCase();
    const { userEmail: _ignored, ...fields } = data;

    let app;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        app = await prisma.visaApplication.create({
          data: {
            ...fields,
            referenceNo: newReference(),
            userId: userEmail === user.email.toLowerCase() ? user.id : null,
            userEmail,
            status: "SUBMITTED",
            statusNotes: "Application received. Our visa desk will review it shortly.",
          },
        });
        break;
      } catch (err: any) {
        if (err?.code !== "P2002" || attempt === 2) throw err; // reference collision → retry
      }
    }

    sendInquiryNotificationEmail({
      division: "VISA",
      name: app!.userName,
      email: app!.userEmail,
      phone: app!.phone,
      subject: `New visa application ${app!.referenceNo}: ${app!.country}`,
      // Passport number deliberately left out of email — staff see it in the portal.
      message: `Reference: ${app!.referenceNo}\nCountry: ${app!.country}\nCategory: ${app!.category}\nArrival: ${app!.intendedArrivalDate ?? "-"}\nStay: ${app!.stayDurationDays ?? "-"} days`,
      referenceId: app!.referenceNo,
    }).catch(() => {});

    res.status(201).json({ success: true, application: toRecord(app), message: "Visa application submitted." });
  })
);

const staffUpdateSchema = applicantFields.partial().extend({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "DOCS_REQUIRED", "EMBASSY_PROCESSING", "APPROVED", "REJECTED"]).optional(),
  statusNotes: str(2000),
});

visasRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { app, owns } = await findOwned(req, req.params.id);

    let data;
    if (isVisaStaff(user)) {
      data = staffUpdateSchema.parse(req.body);
    } else {
      if (!owns) throw new HttpError(404, "Visa application not found.");
      if (!APPLICANT_EDITABLE.has(app.status)) {
        throw new HttpError(409, "This application is already being processed and can no longer be edited. Please contact us.");
      }
      data = {
        ...applicantFields.partial().parse(req.body),
        statusNotes: `Updated by applicant on ${new Date().toISOString().slice(0, 10)}.`,
      };
    }

    const updated = await prisma.visaApplication.update({ where: { id: app.id }, data });
    res.json({ success: true, application: toRecord(updated), message: "Visa application updated." });
  })
);

visasRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { app, owns } = await findOwned(req, req.params.id);
    const applicantWithdraw = owns && app.status === "SUBMITTED";
    if (!isVisaStaff(user) && !applicantWithdraw) {
      throw new HttpError(403, "Only applications that haven't been reviewed yet can be withdrawn.");
    }
    await prisma.visaApplication.delete({ where: { id: app.id } });
    res.json({ success: true, message: "Visa application removed." });
  })
);
