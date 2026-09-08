import { useAuth } from "../../context/AuthContext";

export default function StaffDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Welcome, {user?.name}</h1>
      <p className="mt-2 text-gray-600">
        Use the menu on the left to update construction progress, manage tourism packages and
        promotions, review pending payments, or manage staff accounts — depending on your role.
      </p>
    </div>
  );
}
