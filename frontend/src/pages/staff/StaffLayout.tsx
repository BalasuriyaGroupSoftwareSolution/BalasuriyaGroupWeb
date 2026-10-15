import { useState, type FormEvent } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { KeyRound, LogOut, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveUserRoles, type Role } from "../../types";
import toast from "react-hot-toast";

interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/staff", label: "Dashboard Overview" },
  { to: "/staff/construction", label: "Construction Progress", roles: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF", "ADMIN"] },
  { to: "/staff/tourism", label: "Tourism Packages", roles: ["TOURISM_AGENT", "TOURISM_STAFF", "ADMIN"] },
  { to: "/staff/payments", label: "Payment Approvals", roles: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF", "ADMIN"] },
  { to: "/staff/users", label: "Staff & Section Management", roles: ["ADMIN", "CONSTRUCTION_MANAGER", "TOURISM_AGENT", "SOFTWARE_ENGINEER", "TICKET_AGENT", "FINANCE_APPROVER"] },
];

export default function StaffLayout() {
  const { user, logout, changePassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const effectiveRoles = getEffectiveUserRoles(user);
  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.roles ||
      user?.role === "OWNER" ||
      user?.role === "ADMIN" ||
      item.roles.some((r) => effectiveRoles.includes(r))
  );

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Your password has been updated securely!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch {
      toast.error("Could not change password. Verify your current password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto flex flex-col md:flex-row min-h-[75vh] max-w-7xl gap-8 px-4 py-10">
      <aside className="w-full md:w-64 shrink-0">
        <div className="card space-y-5">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              <Shield className="h-3.5 w-3.5" />
              Staff Operations
            </div>
            <p className="mt-1 font-display text-base font-bold text-brand-navy truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-block rounded-md bg-brand-navy px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                {user?.role.replace(/_/g, " ")}
              </span>
              {user?.secondaryRoles?.map((sr) => (
                <span
                  key={sr}
                  className="inline-block rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900"
                  title="Cross-Section Leadership / Operations"
                >
                  + {sr.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            {user?.department && (
              <p className="mt-1.5 text-[11px] text-gray-500 font-medium">
                {user.department}
                {user.assignedDivisions && user.assignedDivisions.length > 1 && (
                  <span className="text-brand-steel"> &bull; +{user.assignedDivisions.length - 1} sections</span>
                )}
              </p>
            )}
          </div>

          <nav className="space-y-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/staff"}
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-gray-600 hover:bg-brand-surface hover:text-brand-navy"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface transition"
            >
              <KeyRound className="h-3.5 w-3.5 text-brand-gold" />
              Change My Password
            </button>

            <Link
              to="/portal"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-brand-surface transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-steel" />
              Switch to Client View
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {showPasswordModal && (
          <div className="mb-8 rounded-2xl border-2 border-brand-navy/15 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-gold" />
                <h2 className="font-display text-base font-bold text-brand-navy">
                  Change Staff Account Password
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Current / Temporary Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="label">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Enter new strong password"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input text-xs"
                  placeholder="Repeat new password"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
