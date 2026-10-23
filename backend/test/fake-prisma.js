// Minimal in-memory stand-in for the Prisma client, ONLY for the security smoke test.
import crypto from "crypto";
const tables = { user: [], verificationCode: [], visaApplication: [] };
const id = () => crypto.randomBytes(8).toString("hex");
const matches = (row, where = {}) =>
  Object.entries(where).every(([k, v]) => {
    if (k === "OR") return v.some((w) => matches(row, w));
    if (k === "NOT") return !matches(row, v);
    if (v && typeof v === "object" && !(v instanceof Date) && !Array.isArray(v)) {
      if ("not" in v) return row[k] !== v.not;
      if ("in" in v) return v.in.includes(row[k]);
      if ("gt" in v) return row[k] > v.gt;
    }
    return row[k] === v;
  });
const defaults = {
  user: () => ({ role: "CUSTOMER", isActive: true, secondaryRoles: [], assignedDivisions: [], phone: null, passwordHash: null, department: null, jobTitle: null, createdAt: new Date() }),
  verificationCode: () => ({ consumed: false, createdAt: new Date() }),
  visaApplication: () => ({ status: "SUBMITTED", submittedAt: new Date() }),
};
function model(name) {
  const t = tables[name];
  return {
    findUnique: async ({ where }) => t.find((r) => matches(r, where)) ?? null,
    findFirst: async ({ where }) => t.find((r) => matches(r, where)) ?? null,
    findMany: async ({ where } = {}) => t.filter((r) => matches(r, where)),
    count: async ({ where } = {}) => t.filter((r) => matches(r, where)).length,
    create: async ({ data }) => {
      for (const u of ["email", "phone", "referenceNo"]) if (data[u] && t.some((r) => r[u] === data[u])) throw Object.assign(new Error("unique"), { code: "P2002" });
      const row = { ...defaults[name](), ...data, id: id(), updatedAt: new Date() };
      t.push(row);
      return row;
    },
    createMany: async ({ data }) => { let c = 0; for (const d of data) if (!t.some((r) => r.email === d.email)) { t.push({ ...defaults[name](), ...d, id: id() }); c++; } return { count: c }; },
    update: async ({ where, data }) => {
      const row = t.find((r) => matches(r, where));
      if (!row) throw Object.assign(new Error("not found"), { code: "P2025" });
      for (const [k, v] of Object.entries(data)) if (v !== undefined) row[k] = v;
      row.updatedAt = new Date();
      return row;
    },
    updateMany: async ({ where, data }) => { const rows = t.filter((r) => matches(r, where)); rows.forEach((r) => Object.assign(r, data)); return { count: rows.length }; },
    delete: async ({ where }) => { const i = t.findIndex((r) => matches(r, where)); return t.splice(i, 1)[0]; },
  };
}
export const prisma = {
  user: model("user"),
  verificationCode: model("verificationCode"),
  visaApplication: model("visaApplication"),
  $queryRaw: async () => [{ "?column?": 1 }],
  _tables: tables,
};
