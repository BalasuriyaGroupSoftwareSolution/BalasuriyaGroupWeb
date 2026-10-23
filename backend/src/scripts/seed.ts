/**
 * Database seed — SAFE TO RUN ON EVERY DEPLOY.
 *
 * It only ever INSERTS what is missing on a brand-new database. It never
 * updates, overwrites or deletes existing rows, so redeploying can't wipe or
 * reset anything people have entered on the site.
 *
 *  1. If there is no OWNER account yet, create one from SEED_OWNER_EMAIL
 *     (+ SEED_OWNER_PASSWORD, if given).
 *  2. Only on a fresh database (no staff accounts at all yet), add the
 *     company staff roster below. They have NO password: each person signs in
 *     via "Forgot password" / email code, or an admin resets their password
 *     from Staff Users. Once anyone has been added, this step never runs
 *     again — so people you remove stay removed.
 */
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";

type RosterEntry = {
  email: string;
  name: string;
  role: Role;
  secondaryRoles: Role[];
  department: string | null;
  jobTitle: string | null;
  assignedDivisions: string[];
};

const STAFF_ROSTER: RosterEntry[] = [
  { email: "clemonbalasuriyagroup@gmail.com", name: "Mr. Clemon Balasuriya", role: "OWNER", secondaryRoles: [], department: "Executive Board", jobTitle: "Group Chairman & CEO", assignedDivisions: ["Executive Board", "Construction & Engineering", "Tourism & Travel", "Software Solutions", "Air Ticketing", "Finance & Accounts"] },
  { email: "damianbalasuriyagroup@gmail.com", name: "Mr. Damian Balasuriya", role: "ADMIN", secondaryRoles: ["TOURISM_AGENT"], department: "Executive Board", jobTitle: "Managing Director & Head of Tourism", assignedDivisions: ["Executive Board", "Tourism & Travel"] },
  { email: "clavobalasuriyagroup@gmail.com", name: "Mr. Clavo Balasuriya", role: "FINANCE_APPROVER", secondaryRoles: [], department: "Finance & Accounts", jobTitle: "Executive Director & Finance", assignedDivisions: ["Executive Board", "Finance & Accounts"] },
  { email: "christinabalasuriyagroup@gmail.com", name: "Mrs. Christina Balasuriya", role: "ADMIN", secondaryRoles: [], department: "Executive Board", jobTitle: "Executive Director & Corporate Affairs", assignedDivisions: ["Executive Board"] },
  { email: "fonsekamigara@gmail.com", name: "Mr. Migara Fonseka", role: "CONSTRUCTION_MANAGER", secondaryRoles: [], department: "Construction & Engineering", jobTitle: "Head of Construction & Engineering", assignedDivisions: ["Construction & Engineering"] },
  { email: "kaveen.construction@balasuriyagroup.tech", name: "Mr. Kaveen Jayasinghe", role: "CONSTRUCTION_STAFF", secondaryRoles: [], department: "Construction & Engineering", jobTitle: "Senior Civil Engineer & Site Supervisor", assignedDivisions: ["Construction & Engineering"] },
  { email: "nimal.projects@balasuriyagroup.tech", name: "Mr. Nimal Perera", role: "CONSTRUCTION_STAFF", secondaryRoles: [], department: "Construction & Engineering", jobTitle: "Quantity Surveyor & Field Coordinator", assignedDivisions: ["Construction & Engineering"] },
  { email: "damian@balasuriyagroup.tech", name: "Mr. Damian Balasuriya", role: "TOURISM_AGENT", secondaryRoles: [], department: "Tourism & Travel", jobTitle: "Head of Tourism & Global Travel", assignedDivisions: ["Tourism & Travel"] },
  { email: "rashmi.tours@balasuriyagroup.tech", name: "Ms. Rashmi Senanayake", role: "TOURISM_STAFF", secondaryRoles: [], department: "Tourism & Travel", jobTitle: "Senior Travel Consultant & Itinerary Planner", assignedDivisions: ["Tourism & Travel"] },
  { email: "dinuka.visa@balasuriyagroup.tech", name: "Mr. Dinuka Silva", role: "TOURISM_STAFF", secondaryRoles: [], department: "Tourism & Travel", jobTitle: "Foreign Tours & Visa Officer", assignedDivisions: ["Tourism & Travel"] },
  { email: "pasinduhansana@gmail.com", name: "Mr. Pasindu Hansana", role: "SOFTWARE_ENGINEER", secondaryRoles: ["TICKET_AGENT"], department: "Software Solutions", jobTitle: "Head of Software & Aviation Tech Lead", assignedDivisions: ["Software Solutions", "Air Ticketing"] },
  { email: "thilina.dev@balasuriyagroup.tech", name: "Mr. Thilina Bandara", role: "SOFTWARE_STAFF", secondaryRoles: [], department: "Software Solutions", jobTitle: "Senior Full-Stack Developer", assignedDivisions: ["Software Solutions"] },
  { email: "sanduni.qa@balasuriyagroup.tech", name: "Ms. Sanduni Fernando", role: "SOFTWARE_STAFF", secondaryRoles: [], department: "Software Solutions", jobTitle: "QA Engineer & UI/UX Specialist", assignedDivisions: ["Software Solutions"] },
  { email: "shenal@balasuriyagroup.tech", name: "Mr. Shenal Fernando", role: "TICKET_AGENT", secondaryRoles: [], department: "Air Ticketing", jobTitle: "Head of Air Ticketing & Global Desk", assignedDivisions: ["Air Ticketing"] },
  { email: "chathuri.flights@balasuriyagroup.tech", name: "Ms. Chathuri Wickramasinghe", role: "TICKET_STAFF", secondaryRoles: [], department: "Air Ticketing", jobTitle: "Senior GDS Reservations Officer", assignedDivisions: ["Air Ticketing"] },
  { email: "sunil.accounts@balasuriyagroup.tech", name: "Mr. Sunil Wickrema", role: "FINANCE_STAFF", secondaryRoles: [], department: "Finance & Accounts", jobTitle: "Senior Corporate Accounts Executive", assignedDivisions: ["Finance & Accounts"] },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed] DATABASE_URL not set — skipping.");
    return;
  }

  const ownerEmail = (process.env.SEED_OWNER_EMAIL || "clemonbalasuriyagroup@gmail.com").toLowerCase().trim();
  const staffCountBefore = await prisma.user.count({ where: { role: { not: "CUSTOMER" } } });

  const ownerExists = (await prisma.user.count({ where: { role: "OWNER" } })) > 0;
  if (!ownerExists) {
    const rosterOwner = STAFF_ROSTER.find((s) => s.email === ownerEmail);
    const password = process.env.SEED_OWNER_PASSWORD?.trim();
    const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existing) {
      // Someone registered with this email as a customer first — leave them alone, just log it.
      console.log(`[seed] ${ownerEmail} exists but is not OWNER; promote it manually if intended.`);
    } else {
      await prisma.user.create({
        data: {
          email: ownerEmail,
          name: rosterOwner?.name ?? "Balasuriya Group Owner",
          role: "OWNER",
          department: rosterOwner?.department ?? "Executive Board",
          jobTitle: rosterOwner?.jobTitle ?? null,
          assignedDivisions: rosterOwner?.assignedDivisions ?? [],
          passwordHash: password && password.length >= 8 ? await hashPassword(password) : null,
        },
      });
      console.log(
        `[seed] Created OWNER ${ownerEmail}` +
          (password ? " with SEED_OWNER_PASSWORD." : " without a password (use Forgot password to set one).")
      );
    }
  }

  if (staffCountBefore === 0) {
    const result = await prisma.user.createMany({
      data: STAFF_ROSTER.filter((s) => s.email !== ownerEmail).map((s) => ({ ...s, passwordHash: null })),
      skipDuplicates: true,
    });
    console.log(`[seed] Fresh database: added ${result.count} staff roster accounts (no passwords).`);
  } else {
    console.log(`[seed] ${staffCountBefore} staff accounts already exist — roster not touched.`);
  }
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
