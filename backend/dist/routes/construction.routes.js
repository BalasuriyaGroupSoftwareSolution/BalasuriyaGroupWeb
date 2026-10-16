import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
export const constructionRouter = Router();
const STAFF_ROLES = ["CONSTRUCTION_MANAGER", "ADMIN"];
// --- Public: browse the project portfolio (no login required) ---
constructionRouter.get("/projects", asyncHandler(async (req, res) => {
    const featuredOnly = req.query.featured === "true";
    const projects = await prisma.constructionProject.findMany({
        where: featuredOnly ? { featured: true } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
            progressUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });
    res.json({ projects });
}));
constructionRouter.get("/projects/:id", asyncHandler(async (req, res) => {
    const project = await prisma.constructionProject.findUnique({
        where: { id: req.params.id },
        include: { progressUpdates: { orderBy: { createdAt: "desc" } } },
    });
    if (!project)
        throw new HttpError(404, "Project not found.");
    res.json({ project });
}));
// --- Staff only: create/update projects and post progress ---
const projectSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(4000).optional(),
    location: z.string().max(200).optional(),
    status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
    projectType: z.string().max(60).optional(),
    coverImageUrl: z.string().url().max(2000).optional(),
    featured: z.boolean().optional(),
    startDate: z.string().datetime().optional(),
    targetEndDate: z.string().datetime().optional(),
});
constructionRouter.post("/projects", authenticate, requireRole(...STAFF_ROLES), asyncHandler(async (req, res) => {
    const data = projectSchema.parse(req.body);
    const project = await prisma.constructionProject.create({
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
            createdById: req.user.sub,
        },
    });
    res.status(201).json({ project });
}));
constructionRouter.patch("/projects/:id", authenticate, requireRole(...STAFF_ROLES), asyncHandler(async (req, res) => {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.constructionProject.update({
        where: { id: req.params.id },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        },
    });
    res.json({ project });
}));
// This is the core "workers update progress" feature: current status +
// what's planned for the next period, plus a completion percentage.
const progressSchema = z.object({
    currentStatus: z.string().min(3).max(2000),
    nextPeriodPlan: z.string().min(3).max(2000),
    percentComplete: z.number().int().min(0).max(100),
    photoUrls: z.array(z.string().url()).max(20).optional(),
});
constructionRouter.post("/projects/:id/progress", authenticate, requireRole(...STAFF_ROLES), asyncHandler(async (req, res) => {
    const data = progressSchema.parse(req.body);
    const project = await prisma.constructionProject.findUnique({ where: { id: req.params.id } });
    if (!project)
        throw new HttpError(404, "Project not found.");
    const update = await prisma.progressUpdate.create({
        data: {
            projectId: project.id,
            authorId: req.user.sub,
            currentStatus: data.currentStatus,
            nextPeriodPlan: data.nextPeriodPlan,
            percentComplete: data.percentComplete,
            photoUrls: data.photoUrls ?? [],
        },
    });
    res.status(201).json({ update });
}));
//# sourceMappingURL=construction.routes.js.map