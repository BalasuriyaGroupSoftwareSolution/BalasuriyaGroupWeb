import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface Props {
  roles?: Role[];
  /** Where to send a signed-in user who fails the role check. Defaults to the staff home. */
  redirectTo?: string;
}

/** Gates a route (and its nested routes) behind login, and optionally a role list. OWNER always passes. */
export function ProtectedRoute({ roles, redirectTo = "/staff" }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-brand-steel">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && user.role !== "OWNER" && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
