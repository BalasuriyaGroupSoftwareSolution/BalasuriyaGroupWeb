import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";

export const tourismRouter = Router();

const STAFF_ROLES = ["TOURISM_AGENT", "ADMIN"] as const;

// --- Public: browse packages & active promotions ---

tourismRouter.get(
  "/packages",
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const packages = await prisma.tourPackage.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        promotions: {
          where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        },
      },
    });
    res.json({ packages });
  })
);

tourismRouter.get(
  "/packages/:id",
  asyncHandler(async (req, res) => {
    const pkg = await prisma.tourPackage.findUnique({
      where: { id: req.params.id },
      include: { promotions: true },
    });
    if (!pkg || !pkg.isActive) throw new HttpError(404, "Package not found.");
    res.json({ package: pkg });
  })
);

// --- Staff only: manage packages & promotions ---

const packageSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3).max(4000),
  category: z.enum(["LOCAL", "FOREIGN", "FAMILY", "TEAM", "RELIGIOUS"]),
  priceLkr: z.number().positive(),
  durationDays: z.number().int().positive(),
  availableSlots: z.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
});

tourismRouter.post(
  "/packages",
  authenticate,
  requireRole(...STAFF_ROLES),
  asyncHandler(async (req, res) => {
    const data = packageSchema.parse(req.body);
    const pkg = await prisma.tourPackage.create({
      data: { ...data, createdById: req.user!.sub } as any,
    });
    res.status(201).json({ package: pkg });
  })
);

tourismRouter.patch(
  "/packages/:id",
  authenticate,
  requireRole(...STAFF_ROLES),
  asyncHandler(async (req, res) => {
    const data = packageSchema.partial().parse(req.body);
    const pkg = await prisma.tourPackage.update({ where: { id: req.params.id }, data });
    res.json({ package: pkg });
  })
);

const promotionSchema = z.object({
  packageId: z.string().optional(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  discountPercent: z.number().int().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

tourismRouter.post(
  "/promotions",
  authenticate,
  requireRole(...STAFF_ROLES),
  asyncHandler(async (req, res) => {
    const data = promotionSchema.parse(req.body);
    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById: req.user!.sub,
      } as any,
    });
    res.status(201).json({ promotion });
  })
);

tourismRouter.patch(
  "/promotions/:id",
  authenticate,
  requireRole(...STAFF_ROLES),
  asyncHandler(async (req, res) => {
    const data = promotionSchema.partial().parse(req.body);
    const promotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    res.json({ promotion });
  })
);

// --- Customer: book a package (creates a PENDING booking; payment is a separate step) ---

const bookingSchema = z.object({
  packageId: z.string(),
  travelDate: z.string().datetime().optional(),
  travelerCount: z.number().int().positive().default(1),
  notes: z.string().max(1000).optional(),
});

tourismRouter.post(
  "/bookings",
  authenticate,
  asyncHandler(async (req, res) => {
    const data = bookingSchema.parse(req.body);
    const pkg = await prisma.tourPackage.findUnique({ where: { id: data.packageId } });
    if (!pkg || !pkg.isActive) throw new HttpError(404, "Package not found.");

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user!.sub,
        type: "TOUR_PACKAGE",
        packageId: pkg.id,
        details: { travelDate: data.travelDate, travelerCount: data.travelerCount, notes: data.notes },
      },
    });

    res.status(201).json({ booking });
  })
);

tourismRouter.get(
  "/bookings/mine",
  authenticate,
  asyncHandler(async (req, res) => {
    const bookings = await prisma.booking.findMany({
      where: { customerId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      include: { package: true, payments: true },
    });
    res.json({ bookings });
  })
);
