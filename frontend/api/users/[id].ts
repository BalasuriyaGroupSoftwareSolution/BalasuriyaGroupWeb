import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";

const USERS_FILE = "/tmp/balasuriya_staff_users.json";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_USERS: UserRecord[] = [
  { id: "usr_clemon_ceo", name: "Mr. Clemon Balasuriya", email: "clemonbalasuriyagroup@gmail.com", role: "OWNER", phone: "+94 77 123 4567", isActive: true, createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "usr_migara", name: "Mr. Migara Fonseka", email: "fonsekamigara@gmail.com", role: "CONSTRUCTION_MANAGER", phone: "+94 77 234 5678", isActive: true, createdAt: "2026-09-02T00:00:00.000Z" },
  { id: "usr_damian", name: "Mr. Damian Balasuriya", email: "damian@balasuriyagroup.tech", role: "TOURISM_AGENT", phone: "+94 77 345 6789", isActive: true, createdAt: "2026-09-03T00:00:00.000Z" },
  { id: "usr_pasindu", name: "Mr. Pasindu Hansana", email: "pasinduhansana@gmail.com", role: "SOFTWARE_ENGINEER", phone: "+94 77 456 7890", isActive: true, createdAt: "2026-09-04T00:00:00.000Z" },
  { id: "usr_shenal", name: "Mr. Shenal Fernando", email: "shenal@balasuriyagroup.tech", role: "TICKET_AGENT", phone: "+94 77 567 8901", isActive: true, createdAt: "2026-09-05T00:00:00.000Z" },
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
    const { name, phone, role, isActive } = req.body || {};
    const updated = {
      ...users[index],
      name: name !== undefined ? String(name).trim() : users[index].name,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : users[index].phone,
      role: role !== undefined ? String(role).trim() : users[index].role,
      isActive: isActive !== undefined ? Boolean(isActive) : users[index].isActive,
    };
    users[index] = updated;
    saveUsers(users);
    return res.status(200).json({ user: updated, message: "Staff member updated." });
  }

  if (req.method === "DELETE") {
    const removed = users.splice(index, 1)[0];
    saveUsers(users);
    return res.status(200).json({ message: `Staff member ${removed.name} removed permanently.` });
  }

  return res.status(405).json({ message: "Method not allowed." });
}
