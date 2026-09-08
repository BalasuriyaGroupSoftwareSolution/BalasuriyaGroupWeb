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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
