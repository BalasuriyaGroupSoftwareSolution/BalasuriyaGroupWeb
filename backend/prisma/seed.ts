import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@balasuriyagroup.tech";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: "Balasuriya Group Owner",
      role: "OWNER",
      passwordHash: await bcrypt.hash(ownerPassword, 12),
    },
  });

  console.log(`Seeded owner account: ${owner.email}`);
  if (!process.env.SEED_OWNER_PASSWORD) {
    console.log(`Default password is "${ownerPassword}" — change it after first login.`);
  }

  // --- Sample content so the public site isn't empty on first run. ---
  // Edit or delete these any time from the staff portal (Construction / Tourism pages).
  const existingProject = await prisma.constructionProject.findFirst({
    where: { name: "Sample Project — edit or delete me" },
  });
  if (!existingProject) {
    const project = await prisma.constructionProject.create({
      data: {
        name: "Sample Project — edit or delete me",
        description: "Replace this with a real project from the Construction staff dashboard.",
        location: "Colombo, Sri Lanka",
        status: "IN_PROGRESS",
        startDate: new Date(),
        createdById: owner.id,
        progressUpdates: {
          create: [
            {
              authorId: owner.id,
              currentStatus: "Foundation work complete, structural framing underway.",
              nextPeriodPlan: "Begin exterior walls and roofing next month.",
              percentComplete: 35,
            },
          ],
        },
      },
    });
    console.log(`Seeded sample construction project: ${project.name}`);
  }

  const existingPackage = await prisma.tourPackage.findFirst({
    where: { title: "Sample Tour Package — edit or delete me" },
  });
  if (!existingPackage) {
    const pkg = await prisma.tourPackage.create({
      data: {
        title: "Sample Tour Package — edit or delete me",
        description: "Replace this with a real package from the Tourism staff dashboard.",
        category: "LOCAL",
        priceLkr: 25000,
        durationDays: 3,
        availableSlots: 10,
        createdById: owner.id,
      },
    });
    console.log(`Seeded sample tour package: ${pkg.title}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
