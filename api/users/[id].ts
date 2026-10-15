import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";

const USERS_FILE = "/tmp/balasuriya_staff_users.json";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
  secondaryRoles?: string[];
  assignedDivisions?: string[];
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_USERS: UserRecord[] = [
  // Executive Board / Corporate Leadership
  { id: "usr_owner_1", name: "Mr. Clemon Balasuriya", email: "clemonbalasuriyagroup@gmail.com", role: "OWNER", department: "Executive Board", jobTitle: "Group Chairman & CEO", assignedDivisions: ["Executive Board", "Construction & Engineering", "Tourism & Travel", "Software Solutions", "Air Ticketing", "Finance & Accounts"], phone: "+94 76 7171 938", isActive: true, createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "usr_md_2", name: "Mr. Damian Balasuriya", email: "damianbalasuriyagroup@gmail.com", role: "ADMIN", secondaryRoles: ["TOURISM_AGENT"], department: "Executive Board", jobTitle: "Managing Director & Head of Tourism", assignedDivisions: ["Executive Board", "Tourism & Travel"], phone: "+94 76 7171 938", isActive: true, createdAt: "2026-09-02T00:00:00.000Z" },
  { id: "usr_ed_3", name: "Mr. Clavo Balasuriya", email: "clavobalasuriyagroup@gmail.com", role: "FINANCE_APPROVER", department: "Finance & Accounts", jobTitle: "Executive Director & Finance", assignedDivisions: ["Executive Board", "Finance & Accounts"], phone: "+94 76 7171 938", isActive: true, createdAt: "2026-09-03T00:00:00.000Z" },
  { id: "usr_dir_4", name: "Mrs. Christina Balasuriya", email: "christinabalasuriyagroup@gmail.com", role: "ADMIN", department: "Executive Board", jobTitle: "Executive Director & Corporate Affairs", assignedDivisions: ["Executive Board"], phone: "+94 76 7171 938", isActive: true, createdAt: "2026-09-04T00:00:00.000Z" },

  // Construction & Civil Engineering Division
  { id: "usr_migara_5", name: "Mr. Migara Fonseka", email: "fonsekamigara@gmail.com", role: "CONSTRUCTION_MANAGER", department: "Construction & Engineering", jobTitle: "Head of Construction & Engineering", assignedDivisions: ["Construction & Engineering"], phone: "+94 77 234 5678", isActive: true, createdAt: "2026-09-05T00:00:00.000Z" },
  { id: "usr_const_staff_1", name: "Mr. Kaveen Jayasinghe", email: "kaveen.construction@balasuriyagroup.tech", role: "CONSTRUCTION_STAFF", department: "Construction & Engineering", jobTitle: "Senior Civil Engineer & Site Supervisor", assignedDivisions: ["Construction & Engineering"], phone: "+94 77 312 4567", isActive: true, createdAt: "2026-09-10T00:00:00.000Z" },
  { id: "usr_const_staff_2", name: "Mr. Nimal Perera", email: "nimal.projects@balasuriyagroup.tech", role: "CONSTRUCTION_STAFF", department: "Construction & Engineering", jobTitle: "Quantity Surveyor & Field Coordinator", assignedDivisions: ["Construction & Engineering"], phone: "+94 77 423 5678", isActive: true, createdAt: "2026-09-12T00:00:00.000Z" },

  // Tourism & Global Travel Division
  { id: "usr_damian_tours", name: "Mr. Damian Balasuriya", email: "damian@balasuriyagroup.tech", role: "TOURISM_AGENT", department: "Tourism & Travel", jobTitle: "Head of Tourism & Global Travel", assignedDivisions: ["Tourism & Travel"], phone: "+94 77 345 6789", isActive: true, createdAt: "2026-09-06T00:00:00.000Z" },
  { id: "usr_tour_staff_1", name: "Ms. Rashmi Senanayake", email: "rashmi.tours@balasuriyagroup.tech", role: "TOURISM_STAFF", department: "Tourism & Travel", jobTitle: "Senior Travel Consultant & Itinerary Planner", assignedDivisions: ["Tourism & Travel"], phone: "+94 77 534 6789", isActive: true, createdAt: "2026-09-15T00:00:00.000Z" },
  { id: "usr_tour_staff_2", name: "Mr. Dinuka Silva", email: "dinuka.visa@balasuriyagroup.tech", role: "TOURISM_STAFF", department: "Tourism & Travel", jobTitle: "Foreign Tours & Visa Officer", assignedDivisions: ["Tourism & Travel"], phone: "+94 77 645 7890", isActive: true, createdAt: "2026-09-18T00:00:00.000Z" },

  // Software Solutions & IT Division
  { id: "usr_pasindu_6", name: "Mr. Pasindu Hansana", email: "pasinduhansana@gmail.com", role: "SOFTWARE_ENGINEER", secondaryRoles: ["TICKET_AGENT"], department: "Software Solutions", jobTitle: "Head of Software & Aviation Tech Lead", assignedDivisions: ["Software Solutions", "Air Ticketing"], phone: "+94 77 456 7890", isActive: true, createdAt: "2026-09-07T00:00:00.000Z" },
  { id: "usr_soft_staff_1", name: "Mr. Thilina Bandara", email: "thilina.dev@balasuriyagroup.tech", role: "SOFTWARE_STAFF", department: "Software Solutions", jobTitle: "Senior Full-Stack Developer", assignedDivisions: ["Software Solutions"], phone: "+94 77 756 8901", isActive: true, createdAt: "2026-09-20T00:00:00.000Z" },
  { id: "usr_soft_staff_2", name: "Ms. Sanduni Fernando", email: "sanduni.qa@balasuriyagroup.tech", role: "SOFTWARE_STAFF", department: "Software Solutions", jobTitle: "QA Engineer & UI/UX Specialist", assignedDivisions: ["Software Solutions"], phone: "+94 77 867 9012", isActive: true, createdAt: "2026-09-22T00:00:00.000Z" },

  // Air Ticketing & Global Reservations Division
  { id: "usr_shenal_7", name: "Mr. Shenal Fernando", email: "shenal@balasuriyagroup.tech", role: "TICKET_AGENT", department: "Air Ticketing", jobTitle: "Head of Air Ticketing & Global Desk", assignedDivisions: ["Air Ticketing"], phone: "+94 77 567 8901", isActive: true, createdAt: "2026-09-08T00:00:00.000Z" },
  { id: "usr_ticket_staff_1", name: "Ms. Chathuri Wickramasinghe", email: "chathuri.flights@balasuriyagroup.tech", role: "TICKET_STAFF", department: "Air Ticketing", jobTitle: "Senior GDS Reservations Officer", assignedDivisions: ["Air Ticketing"], phone: "+94 77 978 0123", isActive: true, createdAt: "2026-09-25T00:00:00.000Z" },

  // Finance & Accounts Division
  { id: "usr_fin_staff_1", name: "Mr. Sunil Wickrema", email: "sunil.accounts@balasuriyagroup.tech", role: "FINANCE_STAFF", department: "Finance & Accounts", jobTitle: "Senior Corporate Accounts Executive", assignedDivisions: ["Finance & Accounts"], phone: "+94 77 189 1234", isActive: true, createdAt: "2026-09-28T00:00:00.000Z" },
];

function loadUsers(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return DEFAULT_USERS;
}

function saveUsers(users: UserRecord[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === id || u.email.toLowerCase() === String(id).toLowerCase());

  if (index === -1) {
    return res.status(404).json({ message: "Staff user not found." });
  }

  if (req.method === "GET") {
    return res.status(200).json({ user: users[index] });
  }

  if (req.method === "PATCH") {
    const { name, email, phone, role, department, jobTitle, secondaryRoles, assignedDivisions, isActive } = req.body || {};
    const oldEmail = users[index].email.toLowerCase().trim();
    const newEmail = email !== undefined ? String(email).toLowerCase().trim() : oldEmail;

    if (newEmail !== oldEmail && users.some((u, i) => i !== index && u.email.toLowerCase().trim() === newEmail)) {
      return res.status(409).json({ message: "Another staff member already uses this email address." });
    }

    const updated = {
      ...users[index],
      name: name !== undefined ? String(name).trim() : users[index].name,
      email: newEmail,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : users[index].phone,
      role: role !== undefined ? String(role).trim() : users[index].role,
      department: department !== undefined ? (department ? String(department).trim() : null) : users[index].department,
      jobTitle: jobTitle !== undefined ? (jobTitle ? String(jobTitle).trim() : null) : users[index].jobTitle,
      secondaryRoles: secondaryRoles !== undefined ? (Array.isArray(secondaryRoles) ? secondaryRoles.map(String) : []) : users[index].secondaryRoles,
      assignedDivisions: assignedDivisions !== undefined ? (Array.isArray(assignedDivisions) ? assignedDivisions.map(String) : []) : users[index].assignedDivisions,
      isActive: isActive !== undefined ? Boolean(isActive) : users[index].isActive,
    };
    users[index] = updated;
    saveUsers(users);

    // If email changed, migrate credentials in ACCOUNTS_FILE
    if (newEmail !== oldEmail) {
      try {
        const ACCOUNTS_FILE = "/tmp/balasuriya_accounts.json";
        if (fs.existsSync(ACCOUNTS_FILE)) {
          const all = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf-8"));
          if (all[oldEmail]) {
            all[newEmail] = all[oldEmail];
            delete all[oldEmail];
            fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(all, null, 2), "utf-8");
          }
        }
      } catch {}
    }

    return res.status(200).json({ user: updated, message: "Staff member updated." });
  }

  if (req.method === "DELETE") {
    const removed = users.splice(index, 1)[0];
    saveUsers(users);
    return res.status(200).json({ message: `Staff member ${removed.name} removed permanently.` });
  }

  return res.status(405).json({ message: "Method not allowed." });
}
