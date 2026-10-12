import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  HardHat,
  Palmtree,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function StaffDashboard() {
  const { user } = useAuth();

  const isOwnerOrAdmin = user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-navy via-brand-steel to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
            <Shield className="h-4 w-4" />
            Balasuriya Group Management Portal
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Executive Control Desk: {user?.name}
          </h1>
          <p className="mt-2 text-xs text-white/75 max-w-2xl leading-relaxed">
            Welcome to the internal corporate operations console. Authorized for role:{" "}
            <span className="font-bold text-white uppercase">{user?.role.replace(/_/g, " ")}</span>.
            Review cross-division workflows, site progress logs, quotation requests, and payment approvals.
          </p>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-steel">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-brand-navy">5 Sites</span>
            <span className="text-xs text-gray-500">Active Construction</span>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Palmtree className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-brand-navy">6 Tours</span>
            <span className="text-xs text-gray-500">Curated Packages</span>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-brand-navy">Approval</span>
            <span className="text-xs text-gray-500">Finance Queue</span>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-brand-navy">Active</span>
            <span className="text-xs text-gray-500">Staff Governance</span>
          </div>
        </div>
      </div>

      {/* Operational Shortcuts */}
      <div className="card space-y-4">
        <h2 className="font-display font-bold text-lg text-brand-navy">Quick Management Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(isOwnerOrAdmin || user?.role === "CONSTRUCTION_MANAGER") && (
            <Link
              to="/staff/construction"
              className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
            >
              <div className="flex items-center gap-3">
                <HardHat className="h-5 w-5 text-brand-steel group-hover:text-brand-navy transition" />
                <div>
                  <span className="block font-semibold text-xs text-brand-navy">Post Site Progress</span>
                  <span className="text-[11px] text-gray-500">Update completion % and milestone logs</span>
                </div>
              </div>
            </Link>
          )}

          {(isOwnerOrAdmin || user?.role === "TOURISM_AGENT") && (
            <Link
              to="/staff/tourism"
              className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
            >
              <div className="flex items-center gap-3">
                <Palmtree className="h-5 w-5 text-emerald-700 group-hover:text-brand-navy transition" />
                <div>
                  <span className="block font-semibold text-xs text-brand-navy">Manage Tour Packages</span>
                  <span className="text-[11px] text-gray-500">Create packages, pricing & promotions</span>
                </div>
              </div>
            </Link>
          )}

          {(isOwnerOrAdmin || user?.role === "FINANCE_APPROVER") && (
            <Link
              to="/staff/payments"
              className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-amber-700 group-hover:text-brand-navy transition" />
                <div>
                  <span className="block font-semibold text-xs text-brand-navy">Verify Bank Transfers</span>
                  <span className="text-[11px] text-gray-500">Review deposit slips and approve receipts</span>
                </div>
              </div>
            </Link>
          )}

          {isOwnerOrAdmin && (
            <Link
              to="/staff/users"
              className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-700 group-hover:text-brand-navy transition" />
                <div>
                  <span className="block font-semibold text-xs text-brand-navy">Staff & Access Control</span>
                  <span className="text-[11px] text-gray-500">Provision accounts, reset passwords & roles</span>
                </div>
              </div>
            </Link>
          )}

          <Link
            to="/portal"
            className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-700 group-hover:text-brand-navy transition" />
              <div>
                <span className="block font-semibold text-xs text-brand-navy">Preview Client Portal</span>
                <span className="text-[11px] text-gray-500">Inspect client quotes, milestones & tracking</span>
              </div>
            </div>
          </Link>

          <Link
            to="/quote"
            className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-brand-gold group-hover:text-brand-navy transition" />
              <div>
                <span className="block font-semibold text-xs text-brand-navy">Launch RFQ Estimator</span>
                <span className="text-[11px] text-gray-500">Test multi-division project quotation wizard</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
