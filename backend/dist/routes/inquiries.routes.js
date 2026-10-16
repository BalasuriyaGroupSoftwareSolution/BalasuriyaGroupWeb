import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, optionalAuthenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendInquiryNotificationEmail } from "../utils/mailer.js";
export const inquiriesRouter = Router();
const inquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 25,
    message: { message: "Too many inquiries submitted. Please wait a moment." },
});
const inquirySchema = z.object({
    division: z.enum(["CONSTRUCTION", "TOURISM", "SOFTWARE", "AIR_TICKETING", "GENERAL", "VISA"]),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(7).max(25).optional(),
    subject: z.string().min(3).max(200),
    message: z.string().min(5).max(4000),
    details: z.record(z.any()).optional(),
});
// Submit quote/inquiry (public or logged-in)
inquiriesRouter.post("/", inquiryLimiter, optionalAuthenticate, asyncHandler(async (req, res) => {
    const data = inquirySchema.parse(req.body);
    let customerId = req.user?.sub;
    let referenceId = `BG-${data.division.slice(0, 4)}-${Date.now().toString().slice(-6)}`;
    try {
        if (!customerId) {
            // Find or create customer
            const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
            if (existing) {
                customerId = existing.id;
            }
            else {
                const newUser = await prisma.user.create({
                    data: {
                        email: data.email.toLowerCase(),
                        name: data.name,
                        phone: data.phone,
                        role: "CUSTOMER",
                    },
                });
                customerId = newUser.id;
            }
        }
        let bookingType = "GENERAL_INQUIRY";
        if (data.division === "CONSTRUCTION")
            bookingType = "CONSTRUCTION_QUOTE";
        else if (data.division === "TOURISM")
            bookingType = "TOUR_PACKAGE";
        else if (data.division === "AIR_TICKETING")
            bookingType = "AIR_TICKET";
        else if (data.division === "SOFTWARE")
            bookingType = "SOFTWARE_PROJECT";
        else if (data.division === "VISA")
            bookingType = "GENERAL_INQUIRY";
        const booking = await prisma.booking.create({
            data: {
                customerId,
                type: bookingType,
                status: "PENDING",
                details: {
                    division: data.division,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    subject: data.subject,
                    message: data.message,
                    customDetails: data.details,
                    submittedAt: new Date().toISOString(),
                },
            },
        });
        referenceId = booking.id;
    }
    catch (err) {
        console.warn("[INQUIRIES_ROUTE] Database save skipped or offline:", err);
    }
    // Notify balasuriyagroup.info@gmail.com asynchronously
    sendInquiryNotificationEmail({
        division: data.division,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        referenceId,
        details: data.details,
    }).catch((err) => console.error("[INQUIRIES_ROUTE] Mail notification error:", err));
    res.status(201).json({
        success: true,
        referenceId,
        message: "Thank you! Your inquiry and quote request has been received. Our team will contact you shortly.",
    });
}));
// Staff: list inquiries
inquiriesRouter.get("/", authenticate, requireRole("ADMIN", "OWNER", "CONSTRUCTION_MANAGER", "TOURISM_AGENT", "SOFTWARE_ENGINEER"), asyncHandler(async (req, res) => {
    const inquiries = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
        },
    });
    res.json({ inquiries });
}));
//# sourceMappingURL=inquiries.routes.js.map