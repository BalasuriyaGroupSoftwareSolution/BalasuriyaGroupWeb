import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types";

interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/staff", label: "Dashboard" },
  { to: "/staff/construction", label: "Construction Progress", roles: ["CONSTRUCTION_MANAGER", "ADMIN"] },
  { to: "/staff/tourism", label: "Tourism Packages", roles: ["TOURISM_AGENT", "ADMIN"] },
  { to: "/staff/payments", label: "Payment Approvals", roles: ["FINANCE_APPROVER", "ADMIN"] },
  { to: "/staff/users", label: "Staff Accounts", roles: ["ADMIN"] },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || user?.role === "OWNER" || item.roles.includes(user!.role)
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl gap-8 px-4 py-10">
      <aside className="w-56 shrink-0">
        <p className="text-xs uppercase tracking-wide text-gray-400">Signed in as</p>
        <p className="font-medium text-brand-navy">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.role.replace(/_/g, " ")}</p>

        <nav className="mt-6 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/staff"}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-navy text-white" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={logout} className="mt-6 text-sm text-gray-400 hover:text-brand-navy">
          Log out
        </button>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
