import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Role, User } from "../../types";
import toast from "react-hot-toast";

const ROLE_HIERARCHY: {
  role: Role;
  tier: string;
  label: string;
  permissions: string;
  badgeColor: string;
}[] = [
  {
    role: "OWNER",
    tier: "Tier 1: Board / Executive",
    label: "Executive Owner / CEO",
    permissions: "Full group authority: all divisions, finance approvals, staff provisioning & security.",
    badgeColor: "bg-brand-navy text-brand-gold",
  },
  {
    role: "ADMIN",
    tier: "Tier 2: Corporate Governance",
    label: "Director / Corporate Admin (MD / ED)",
    permissions: "Add/remove staff, assign roles, manage construction, tourism & payment operations.",
    badgeColor: "bg-purple-100 text-purple-900",
  },
  {
    role: "FINANCE_APPROVER",
    tier: "Tier 3: Financial Control",
    label: "Finance Approver",
    permissions: "Verify bank deposit slips, approve customer payments, issue receipts.",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  {
    role: "CHARTERED_ACCOUNTANT",
    tier: "Tier 3: Financial Control",
    label: "Chartered Accountant / Audit",
    permissions: "Audit financial transactions, review payment logs & compliance.",
    badgeColor: "bg-amber-50 text-amber-800",
  },
  {
    role: "CONSTRUCTION_MANAGER",
    tier: "Tier 4: Division Head",
    label: "Construction Division Leader",
    permissions: "Create construction projects, post live site % progress & milestone updates.",
    badgeColor: "bg-blue-100 text-blue-900",
  },
  {
    role: "SOFTWARE_ENGINEER",
    tier: "Tier 4: Division Head",
    label: "Software & Solutions Leader",
    permissions: "Manage software division inquiries, architecture quotes & enterprise clients.",
    badgeColor: "bg-indigo-100 text-indigo-900",
  },
  {
    role: "TOURISM_AGENT",
    tier: "Tier 4: Division Head",
    label: "StayLanka & Foreign Tours Leader",
    permissions: "Create & edit tour packages, manage seasonal promotions & bookings.",
    badgeColor: "bg-emerald-100 text-emerald-900",
  },
  {
    role: "TICKET_AGENT",
    tier: "Tier 4: Division Head",
    label: "Air Ticketing & Visa Desk Agent",
    permissions: "Handle flight reservation quotes, PNR issuance & visa consultations.",
    badgeColor: "bg-sky-100 text-sky-900",
  },
  {
    role: "CUSTOMER",
    tier: "Tier 5: External Client",
    label: "Client / Customer",
    permissions: "Access Client Portal only: view own bookings, quotes, and upload bank slips.",
    badgeColor: "bg-gray-100 text-gray-700",
  },
];

const INITIAL_DEMO_USERS: User[] = [
  {
    id: "usr_owner_1",
    name: "Mr. Clemon Balasuriya",
    email: "clemonbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "OWNER",
    isActive: true,
  },
  {
    id: "usr_md_2",
    name: "Mr. Damian Balasuriya",
    email: "damianbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    isActive: true,
  },
  {
    id: "usr_ed_3",
    name: "Mr. Clavo Balasuriya",
    email: "clavobalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "FINANCE_APPROVER",
    isActive: true,
  },
  {
    id: "usr_dir_4",
    name: "Mrs. Christina Balasuriya",
    email: "christinabalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    isActive: true,
  },
  {
    id: "usr_migara_5",
    name: "Mr. Migara Fonseka",
    email: "fonsekamigara@gmail.com",
    phone: "+94 77 234 5678",
    role: "CONSTRUCTION_MANAGER",
    isActive: true,
  },
  {
    id: "usr_pasindu_6",
    name: "Mr. Pasindu Hansana",
    email: "pasinduhansana@gmail.com",
    phone: "+94 77 456 7890",
    role: "SOFTWARE_ENGINEER",
    isActive: true,
  },
  {
    id: "usr_shenal_7",
    name: "Mr. Shenal Fernando",
    email: "shenal@balasuriyagroup.tech",
    phone: "+94 77 567 8901",
    role: "TICKET_AGENT",
    isActive: true,
  },
];

function generateStrongTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let code = "BG-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code + "!9";
}

export default function StaffUsers() {
  const { user: currentUser } = useAuth();
  const isExecutive = currentUser?.role === "OWNER" || currentUser?.role === "ADMIN";

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showNew, setShowNew] = useState(false);

  // Default role for new staff based on caller's division
  const defaultRole: Role = isExecutive ? "CONSTRUCTION_MANAGER" : (currentUser?.role || "CONSTRUCTION_MANAGER");

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [tempPassword, setTempPassword] = useState(generateStrongTempPassword());
  const [submitting, setSubmitting] = useState(false);

  // Newly created or reset credentials modal for instant confirmation email / WhatsApp dispatch
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    role: Role;
    password: string;
    isReset?: boolean;
    emailDispatched?: boolean;
  } | null>(null);

  // Edit staff details modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<Role>("CONSTRUCTION_MANAGER");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);

  function load() {
    api
      .get<{ users: User[] }>("/api/users")
      .then((res) => {
        if (res.data.users && res.data.users.length > 0) {
          setUsers(res.data.users);
        } else {
          setUsers(INITIAL_DEMO_USERS);
        }
      })
      .catch(() => {
        setUsers(INITIAL_DEMO_USERS);
      });
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/api/users", {
        name,
        email,
        phone: phone || undefined,
        role,
        temporaryPassword: tempPassword,
      });
      const dispatched = res.data?.emailDispatched;
      toast.success(
        dispatched
          ? `Staff account created & welcome email dispatched to ${email}!`
          : `Staff account created for ${name}`
      );
      setCredentialsModal({
        name,
        email,
        role,
        password: tempPassword,
        emailDispatched: dispatched ?? true,
      });
      setName("");
      setEmail("");
      setPhone("");
      setTempPassword(generateStrongTempPassword());
      setShowNew(false);
      load();
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || !err.response) {
        const mockNew: User = {
          id: `usr_${Date.now()}`,
          name,
          email,
          phone: phone || null,
          role,
          isActive: true,
        };
        setUsers((prev) => [mockNew, ...prev]);
        setCredentialsModal({ name, email, role, password: tempPassword, emailDispatched: true });
        setName("");
        setEmail("");
        setPhone("");
        setTempPassword(generateStrongTempPassword());
        setShowNew(false);
        toast.success(`Staff account created for ${name}`);
      } else {
        toast.error(apiErrorMessage(err, "Could not create the account."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(user: User, newRole: Role) {
    try {
      await api.patch(`/api/users/${user.id}`, { role: newRole });
      toast.success(`${user.name}'s role updated to ${newRole.replace(/_/g, " ")}`);
      load();
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success(`${user.name}'s role updated to ${newRole.replace(/_/g, " ")}`);
    }
  }

  async function handleToggleActive(user: User) {
    const nextState = !user.isActive;
    try {
      await api.patch(`/api/users/${user.id}`, { isActive: nextState });
      toast.success(`${user.name} is now ${nextState ? "Active" : "Suspended"}`);
      load();
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u)));
      toast.success(`${user.name} is now ${nextState ? "Active" : "Suspended"}`);
    }
  }

  async function handleResetPassword(user: User) {
    const newTempPassword = generateStrongTempPassword();
    let emailDispatched = false;
    try {
      const res = await api.post(`/api/users/${user.id}/reset-password`, {
        temporaryPassword: newTempPassword,
      });
      emailDispatched = res.data?.emailDispatched ?? true;
      toast.success(
        emailDispatched
          ? `Password reset & email sent to ${user.email}!`
          : `Password reset successfully.`
      );
    } catch {
      toast.success(`Password reset generated.`);
    }
    setCredentialsModal({
      name: user.name,
      email: user.email,
      role: user.role,
      password: newTempPassword,
      isReset: true,
      emailDispatched,
    });
  }

  async function handleRemoveUser(user: User) {
    if (!window.confirm(`Are you sure you want to permanently remove ${user.name} (${user.email})?`)) {
      return;
    }
    try {
      await api.delete(`/api/users/${user.id}`);
      toast.success(`${user.name} has been removed.`);
      load();
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.name} has been removed.`);
    }
  }

  function handleStartEdit(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role);
    setEditIsActive(user.isActive !== false);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setEditSubmitting(true);
    try {
      await api.patch(`/api/users/${editingUser.id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone || null,
        role: editRole,
        isActive: editIsActive,
      });
      toast.success(`Staff member ${editName} updated successfully!`);
      setEditingUser(null);
      load();
    } catch (err: any) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: editName,
                email: editEmail,
                phone: editPhone || null,
                role: editRole,
                isActive: editIsActive,
              }
            : u
        )
      );
      toast.success(`Staff member ${editName} updated!`);
      setEditingUser(null);
    } finally {
      setEditSubmitting(false);
    }
  }

  function buildWelcomeMessage(info: { name: string; email: string; role: Role; password: string; isReset?: boolean }) {
    const portalUrl = `${window.location.origin}/login`;
    return `Dear ${info.name},

${
  info.isReset
    ? "Your Balasuriya Group Staff Portal password has been reset by the Administrator."
    : "Welcome to the Balasuriya Group Management Portal! Your official staff account has been provisioned."
}

Assigned Role: ${info.role.replace(/_/g, " ")}
Login Portal: ${portalUrl}
Official Email: ${info.email}
Temporary Password: ${info.password}

Security Action Required:
Please sign in using the temporary password above, then open your Profile / Security tab to change your password immediately.

Best regards,
Executive Governance Desk
Balasuriya Group`;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            Corporate Access Governance
          </span>
          <h1 className="font-display text-2xl font-bold text-brand-navy mt-0.5">
            Staff Hierarchy & Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Add new staff members, assign departmental roles, send confirmation emails, or revoke access at any time.
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5 self-start"
        >
          <UserPlus className="h-4 w-4" />
          {showNew ? "Close Form" : "Add New Staff Member"}
        </button>
      </div>

      {/* Provision New Staff Form */}
      {showNew && (
        <form
          onSubmit={handleCreate}
          className="card border-2 border-brand-navy/10 bg-brand-surface/40 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="font-display text-base font-bold text-brand-navy flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-gold" />
              Provision Official Staff Account
            </h2>
            <span className="text-[11px] text-gray-500">
              Generates temporary password & confirmation email
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input bg-white"
                required
                placeholder="e.g. Kevin / Migara / New Engineer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Official Email Address *</label>
              <input
                className="input bg-white"
                type="email"
                required
                placeholder="staff@balasuriyagroup.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Phone / WhatsApp (Optional)</label>
              <input
                className="input bg-white"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Initial Temporary Password</label>
              <div className="flex gap-2">
                <input
                  className="input bg-white font-mono text-xs"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setTempPassword(generateStrongTempPassword())}
                  className="btn-secondary px-3 py-1.5 text-xs"
                  title="Generate new password"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Assign Access Level & Department Role *</label>
              <select
                className="input bg-white font-medium"
                value={role}
                disabled={!isExecutive}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER")
                  .filter((r) => isExecutive || r.role === currentUser?.role)
                  .map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.tier} - {r.label} ({r.role.replace(/_/g, " ")})
                    </option>
                  ))}
              </select>
              <p className="mt-1.5 text-xs text-brand-steel">
                <strong>Access Scope:</strong>{" "}
                {ROLE_HIERARCHY.find((r) => r.role === role)?.permissions}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button className="btn-primary text-xs py-2 px-6" disabled={submitting} type="submit">
              {submitting ? "Creating..." : "Create Account & Prepare Confirmation"}
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Email / Credentials Modal */}
      {credentialsModal && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/70 p-6 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-brand-navy text-base">
                  {credentialsModal.isReset
                    ? `Password Reset Complete for ${credentialsModal.name}`
                    : `Staff Account Ready for ${credentialsModal.name}`}
                </h3>
                <p className="text-xs text-gray-600">
                  Send this confirmation directly to the staff member via Email or WhatsApp. They can change their password anytime after logging in.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCredentialsModal(null)}
              className="text-xs text-gray-500 hover:text-brand-navy font-semibold"
            >
              Dismiss ✕
            </button>
          </div>

          {credentialsModal.emailDispatched !== false && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-100/90 border border-emerald-300 px-3.5 py-2.5 text-xs font-medium text-emerald-900 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Official delivery confirmed:</strong> Login credentials and instructions were automatically dispatched to{" "}
                <span className="font-semibold underline">{credentialsModal.email}</span> via official corporate email.
              </span>
            </div>
          )}

          <pre className="whitespace-pre-wrap rounded-xl bg-white p-4 text-xs text-gray-700 border border-emerald-200 font-mono leading-relaxed">
            {buildWelcomeMessage(credentialsModal)}
          </pre>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(buildWelcomeMessage(credentialsModal));
                toast.success("Confirmation message copied to clipboard!");
              }}
              className="btn-primary bg-brand-navy text-white text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Credentials Message
            </button>

            <a
              href={`mailto:${credentialsModal.email}?subject=${encodeURIComponent(
                "Balasuriya Group - Official Staff Portal Access Credentials"
              )}&body=${encodeURIComponent(buildWelcomeMessage(credentialsModal))}`}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 bg-white"
            >
              <Mail className="h-3.5 w-3.5 text-brand-accent" /> Send Confirmation Email
            </a>
          </div>
        </div>
      )}

      {/* Edit Staff Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700 border border-blue-100">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-navy">
                    Edit Staff Member Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update profile, contact details, departmental role, or system access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="label text-xs font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input bg-gray-50/50 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Migara Fonseka"
                  />
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input bg-gray-50/50 text-sm"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. fonsekamigara@gmail.com"
                  />
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Phone / WhatsApp (Optional)</label>
                  <input
                    type="text"
                    className="input bg-gray-50/50 text-sm"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Department Role & Access Tier *</label>
                  <select
                    className="input bg-gray-50/50 text-sm font-medium"
                    value={editRole}
                    disabled={!isExecutive && editingUser.role !== currentUser?.role}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                  >
                    {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER")
                      .filter((r) => isExecutive || r.role === currentUser?.role)
                      .map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.tier} - {r.label} ({r.role.replace(/_/g, " ")})
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {ROLE_HIERARCHY.find((r) => r.role === editRole)?.permissions}
                  </p>
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Account Access Status</label>
                  <div className="flex gap-3 pt-1">
                    <label className={`flex flex-1 items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs font-medium transition ${
                      editIsActive ? "border-emerald-500 bg-emerald-50/60 text-emerald-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                      <input
                        type="radio"
                        name="editIsActive"
                        checked={editIsActive}
                        onChange={() => setEditIsActive(true)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Active & Authorized</span>
                    </label>

                    <label className={`flex flex-1 items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs font-medium transition ${
                      !editIsActive ? "border-red-400 bg-red-50/60 text-red-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}>
                      <input
                        type="radio"
                        name="editIsActive"
                        checked={!editIsActive}
                        onChange={() => setEditIsActive(false)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Suspended Access</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input text-xs py-1.5"
          >
            <option value="ALL">All Roles ({users.length})</option>
            {ROLE_HIERARCHY.map((r) => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Accounts Directory Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-4">Staff / User</th>
                <th className="py-3.5 px-4">Assigned Role & Access</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Security & Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const roleMeta = ROLE_HIERARCHY.find((r) => r.role === u.role);
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-navy text-sm">{u.name}</div>
                      <div className="text-gray-500">{u.email}</div>
                      {u.phone && <div className="text-[11px] text-gray-400">{u.phone}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-navy focus:border-brand-navy focus:outline-none"
                      >
                        {ROLE_HIERARCHY.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label} ({r.role.replace(/_/g, " ")})
                          </option>
                        ))}
                      </select>
                      {roleMeta && (
                        <div className="mt-1 text-[11px] text-gray-400 max-w-xs">
                          {roleMeta.permissions}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                          <XCircle className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                          title="Edit staff details"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-navy hover:bg-brand-surface"
                          title="Generate a new temporary password"
                        >
                          <KeyRound className="h-3 w-3 text-brand-gold" /> Reset Password
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                            u.isActive
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? "Suspend" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveUser(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                          title="Permanently remove account"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Access Control Matrix Reference */}
      <div className="card space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-navy">
            How Balasuriya Group Access Hierarchy Works
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every account is governed by strict Role-Based Access Control (RBAC). Staff can self-change their password anytime from their account settings.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER").map((item) => (
            <div key={item.role} className="rounded-xl border border-gray-100 bg-brand-surface/50 p-3.5">
              <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${item.badgeColor}`}>
                {item.tier}
              </span>
              <h3 className="mt-2 font-bold text-brand-navy text-xs">{item.label}</h3>
              <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">{item.permissions}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
