import { useEffect, useState, type FormEvent } from "react";
import { api, apiErrorMessage } from "../../lib/api";
import type { Role, User } from "../../types";
import toast from "react-hot-toast";

const STAFF_ROLES: Role[] = [
  "ADMIN",
  "CONSTRUCTION_MANAGER",
  "TOURISM_AGENT",
  "FINANCE_APPROVER",
  "TICKET_AGENT",
  "SOFTWARE_ENGINEER",
  "CHARTERED_ACCOUNTANT",
];

function randomTempPassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

export default function StaffUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("TOURISM_AGENT");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get<{ users: User[] }>("/api/users").then((res) => setUsers(res.data.users));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const temporaryPassword = randomTempPassword();
    try {
      await api.post("/api/users", { name, email, role, temporaryPassword });
      toast.success(`Staff account created. Temporary password: ${temporaryPassword}`, { duration: 10000 });
      setName("");
      setEmail("");
      setShowNew(false);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create the account."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await api.patch(`/api/users/${user.id}`, { isActive: !user.isActive });
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleResetPassword(user: User) {
    const temporaryPassword = randomTempPassword();
    try {
      await api.post(`/api/users/${user.id}/reset-password`, { temporaryPassword });
      toast.success(`New temporary password for ${user.email}: ${temporaryPassword}`, { duration: 10000 });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Staff Accounts</h1>
        <button className="btn-secondary py-1.5 text-xs" onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "New staff account"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="card mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={submitting} type="submit">
              Create account
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-gray-400">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-2 font-medium text-brand-navy">{u.name}</td>
                <td className="text-gray-600">{u.email}</td>
                <td className="text-gray-600">{u.role.replace(/_/g, " ")}</td>
                <td>
                  <span className={u.isActive ? "text-green-600" : "text-red-500"}>
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="space-x-2 py-2 text-right">
                  <button className="text-xs font-medium text-brand-accent" onClick={() => handleResetPassword(u)}>
                    Reset password
                  </button>
                  <button className="text-xs font-medium text-gray-500" onClick={() => handleToggleActive(u)}>
                    {u.isActive ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
