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
  // Edit, unselect, or delete these any time from the Construction staff dashboard —
  // each is marked "featured" so it shows in the public "Selected Projects" showcase.
  const sampleProjects: Array<{
    name: string;
    description: string;
    location: string;
    projectType: string;
    coverImageUrl: string;
    status: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED";
    currentStatus: string;
    nextPeriodPlan: string;
    percentComplete: number;
  }> = [
    {
      name: "Cinnamon Heights Residences",
      description:
        "A 12-storey residential apartment complex with 64 units, underground parking, and a rooftop garden.",
      location: "Colombo 05, Sri Lanka",
      projectType: "Residential",
      coverImageUrl: "/images/projects/residential.svg",
      status: "IN_PROGRESS",
      currentStatus: "Structural framing complete up to the 9th floor; interior partitioning underway from floor 3.",
      nextPeriodPlan: "Complete framing to the roof slab and begin façade glazing on the lower floors.",
      percentComplete: 62,
    },
    {
      name: "Horizon Business Tower",
      description: "A 20-storey Grade-A office tower with ground-floor retail and a five-level basement car park.",
      location: "Colombo 02, Sri Lanka",
      projectType: "Commercial",
      coverImageUrl: "/images/projects/commercial.svg",
      status: "IN_PROGRESS",
      currentStatus: "Basement excavation and shoring complete; core wall construction has started.",
      nextPeriodPlan: "Continue core wall pours and begin ground-floor slab formwork.",
      percentComplete: 40,
    },
    {
      name: "Kandy–Mahiyangana Highway Extension",
      description: "An 18km two-lane highway extension including a new river crossing bridge.",
      location: "Kandy District, Sri Lanka",
      projectType: "Infrastructure",
      coverImageUrl: "/images/projects/infrastructure.svg",
      status: "IN_PROGRESS",
      currentStatus: "Road base and drainage complete for 14km; bridge piers cast and deck launching in progress.",
      nextPeriodPlan: "Finish bridge deck, then begin asphalt surfacing on the completed sections.",
      percentComplete: 78,
    },
    {
      name: "Galle Fort Boutique Hotel Renovation",
      description: "Heritage-sensitive restoration of a colonial-era building into a 14-room boutique hotel.",
      location: "Galle Fort, Sri Lanka",
      projectType: "Renovation",
      coverImageUrl: "/images/projects/renovation.svg",
      status: "COMPLETED",
      currentStatus: "Restoration complete — original façade, arches, and roof structure preserved and reinforced.",
      nextPeriodPlan: "Project complete; handed over to the client for interior fit-out and opening.",
      percentComplete: 100,
    },
    {
      name: "Seeduwa Logistics Warehouse",
      description: "A 6,000 sqm logistics and distribution warehouse with attached office space, near the airport.",
      location: "Seeduwa, Sri Lanka",
      projectType: "Industrial",
      coverImageUrl: "/images/projects/industrial-blueprint.svg",
      status: "PLANNING",
      currentStatus: "Site plan and structural drawings approved; groundworks contractor being finalized.",
      nextPeriodPlan: "Mobilize site and begin ground leveling and foundation excavation.",
      percentComplete: 10,
    },
  ];

  for (const p of sampleProjects) {
    const existing = await prisma.constructionProject.findFirst({ where: { name: p.name } });
    if (existing) continue;
    const project = await prisma.constructionProject.create({
      data: {
        name: p.name,
        description: p.description,
        location: p.location,
        projectType: p.projectType,
        coverImageUrl: p.coverImageUrl,
        featured: true,
        status: p.status,
        startDate: new Date(),
        createdById: owner.id,
        progressUpdates: {
          create: [
            {
              authorId: owner.id,
              currentStatus: p.currentStatus,
              nextPeriodPlan: p.nextPeriodPlan,
              percentComplete: p.percentComplete,
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
