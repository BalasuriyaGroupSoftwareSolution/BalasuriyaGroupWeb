import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { createCardPaymentIntent, createGooglePayPaymentIntent, PaymentProviderNotConfiguredError, } from "../services/paymentProviders.js";
export const paymentsRouter = Router();
const FINANCE_ROLES = ["FINANCE_APPROVER", "ADMIN"];
const createPaymentSchema = z.object({
    bookingId: z.string(),
    amountLkr: z.number().positive(),
    method: z.enum(["CARD", "GOOGLE_PAY", "BANK_DEPOSIT", "KOKO"]),
    // Required for BANK_DEPOSIT / KOKO: the slip number / transaction reference
    // the customer got when they paid outside the app.
    reference: z.string().max(200).optional(),
});
// Customer starts a payment for their own booking.
paymentsRouter.post("/", authenticate, asyncHandler(async (req, res) => {
    const data = createPaymentSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
    if (!booking)
        throw new HttpError(404, "Booking not found.");
    if (booking.customerId !== req.user.sub) {
        throw new HttpError(403, "You can only pay for your own bookings.");
    }
    if ((data.method === "BANK_DEPOSIT" || data.method === "KOKO") && !data.reference) {
        throw new HttpError(400, "Please provide the deposit/transaction reference.");
    }
    // Manual methods (bank deposit, Koko) go straight to PENDING for staff to
    // review. Card / Google Pay need a live gateway response first.
    let clientPayload;
    try {
        if (data.method === "CARD") {
            clientPayload = (await createCardPaymentIntent(data.amountLkr)).clientPayload;
        }
        else if (data.method === "GOOGLE_PAY") {
            clientPayload = (await createGooglePayPaymentIntent(data.amountLkr)).clientPayload;
        }
    }
    catch (err) {
        if (err instanceof PaymentProviderNotConfiguredError) {
            throw new HttpError(503, err.message);
        }
        throw err;
    }
    const payment = await prisma.payment.create({
        data: {
            bookingId: booking.id,
            amountLkr: data.amountLkr,
            method: data.method,
            reference: data.reference,
            status: "PENDING",
        },
    });
    res.status(201).json({ payment, clientPayload });
}));
// Finance/admin: queue of payments awaiting approval.
paymentsRouter.get("/pending", authenticate, requireRole(...FINANCE_ROLES), asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        include: { booking: { include: { customer: true, package: true } } },
    });
    res.json({ payments });
}));
const decisionSchema = z.object({ notes: z.string().max(1000).optional() });
paymentsRouter.patch("/:id/approve", authenticate, requireRole(...FINANCE_ROLES), asyncHandler(async (req, res) => {
    const { notes } = decisionSchema.parse(req.body ?? {});
    const payment = await prisma.payment.update({
        where: { id: req.params.id },
        data: { status: "APPROVED", approvedById: req.user.sub, approvedAt: new Date(), notes },
    });
    res.json({ payment });
}));
paymentsRouter.patch("/:id/reject", authenticate, requireRole(...FINANCE_ROLES), asyncHandler(async (req, res) => {
    const { notes } = decisionSchema.parse(req.body ?? {});
    const payment = await prisma.payment.update({
        where: { id: req.params.id },
        data: { status: "REJECTED", approvedById: req.user.sub, approvedAt: new Date(), notes },
    });
    res.json({ payment });
}));
//# sourceMappingURL=payments.routes.js.map