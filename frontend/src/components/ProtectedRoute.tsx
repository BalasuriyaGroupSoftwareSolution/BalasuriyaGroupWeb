import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface Props {
  roles?: Role[];
}

/** Gates a route (and its nested routes) behind login, and optionally a role list. OWNER always passes. */
export function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-brand-steel">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && user.role !== "OWNER" && !roles.includes(user.role)) {
    return <Navigate to="/staff" replace />;
  }

  return <Outlet />;
}
