import { PrismaClient } from "@prisma/client";

// One PrismaClient per process. On Vercel a warm function instance reuses it
// across requests instead of opening a new database connection every time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

globalForPrisma.prisma = prisma;
