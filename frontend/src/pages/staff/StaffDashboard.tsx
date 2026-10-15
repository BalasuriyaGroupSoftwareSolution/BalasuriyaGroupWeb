import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Filter,
  HardHat,
  Palmtree,
  Plane,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getStoredActivities,
  logStaffActivity,
  type ActivityEvent,
} from "../../lib/activityLogger";
import toast from "react-hot-toast";

interface ApprovalItem {
  id: string;
  division: "CONSTRUCTION" | "TOURISM" | "SOFTWARE" | "TICKETING" | "FINANCE";
  divisionTitle: string;
  title: string;
  description: string;
  submittedBy: string;
  submitterRole: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  urgency: "HIGH" | "MEDIUM" | "NORMAL";
}

const INITIAL_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: "appr-01",
    division: "CONSTRUCTION",
    divisionTitle: "Construction & Engineering",
    title: "Galle Fort Boutique Villa — Piling & Foundation Phase Sign-off (85%)",
    description: "Site team completed pile integrity tests and steel reinforcement inspection. Requesting milestone release to proceed with Ground Floor slab casting.",
    submittedBy: "Kamal Perera",
    submitterRole: "Civil Site Engineer",
    submittedAt: "Today, 10:15 AM",
    status: "PENDING",
    urgency: "HIGH",
  },
  {
    id: "appr-02",
    division: "SOFTWARE",
    divisionTitle: "Software & Digital Solutions",
    title: "Hayleys PLC Enterprise Cloud Architecture — Phase 1 Deliverable",
    description: "Multi-tenant inventory sync API specification & microservice architecture blueprints submitted for client handoff.",
    submittedBy: "Shenal Senanayake",
    submitterRole: "Full Stack Engineer",
    submittedAt: "Today, 11:30 AM",
    status: "PENDING",
    urgency: "HIGH",
  },
  {
    id: "appr-03",
    division: "TOURISM",
    divisionTitle: "StayLanka & Foreign Tours",
    title: "7-Day Hill Country Tea Trail — Seasonal Promotional Package (-15%)",
    description: "Curated Ella, Nuwara Eliya & Kandy luxury bungalow package with private chauffeur transport ready for winter season launch.",
    submittedBy: "Nimal Fernando",
    submitterRole: "Tour Coordinator",
    submittedAt: "Yesterday, 4:45 PM",
    status: "PENDING",
    urgency: "MEDIUM",
  },
  {
    id: "appr-04",
    division: "TICKETING",
    divisionTitle: "Air Ticketing & Visa",
    title: "Group PNR Corporate Fare Authorization for MAS Holdings (14 Pax)",
    description: "Colombo - Singapore - Tokyo round-trip block booking discount rate requires division head or director sign-off.",
    submittedBy: "Dilani Silva",
    submitterRole: "Air Ticketing Desk Officer",
    submittedAt: "Yesterday, 2:10 PM",
    status: "PENDING",
    urgency: "NORMAL",
  },
  {
    id: "appr-05",
    division: "FINANCE",
    divisionTitle: "Corporate Finance",
    title: "Direct Bank Slip Verification #DEP-9042 (LKR 850,000)",
    description: "Commercial warehouse advance payment slip uploaded by client via portal for verification against Commercial Bank statements.",
    submittedBy: "Ruwan Jayawardena",
    submitterRole: "Finance Accounts Clerk",
    submittedAt: "Yesterday, 11:00 AM",
    status: "PENDING",
    urgency: "HIGH",
  },
];

export default function StaffDashboard() {
  const { user } = useAuth();

  const isOwnerOrAdmin = user?.role === "OWNER" || user?.role === "ADMIN";
  const isDivisionLeader = [
    "CONSTRUCTION_MANAGER",
    "TOURISM_AGENT",
    "SOFTWARE_ENGINEER",
    "TICKET_AGENT",
    "FINANCE_APPROVER",
    "CHARTERED_ACCOUNTANT",
  ].includes(user?.role || "");
  const canManageStaff = isOwnerOrAdmin || isDivisionLeader;

  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVAL_ITEMS);
  const [activities, setActivities] = useState<ActivityEvent[]>(() => getStoredActivities());
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const [activityDivisionFilter, setActivityDivisionFilter] = useState<string>("ALL");
  const [activitySearch, setActivitySearch] = useState<string>("");

  useEffect(() => {
    const handleNewActivity = (e: Event) => {
      const customEvt = e as CustomEvent<ActivityEvent>;
      if (customEvt.detail) {
        setActivities((prev) => [customEvt.detail, ...prev.filter((a) => a.id !== customEvt.detail.id)]);
      }
    };
    window.addEventListener("bg_staff_activity_added", handleNewActivity);
    return () => window.removeEventListener("bg_staff_activity_added", handleNewActivity);
  }, []);

  function canUserApprove(item: ApprovalItem): boolean {
    if (isOwnerOrAdmin) return true; // CEO & Directors can approve ANY division item
    if (user?.role === "CONSTRUCTION_MANAGER" && item.division === "CONSTRUCTION") return true;
    if (user?.role === "SOFTWARE_ENGINEER" && item.division === "SOFTWARE") return true;
    if (user?.role === "TOURISM_AGENT" && item.division === "TOURISM") return true;
    if (user?.role === "TICKET_AGENT" && item.division === "TICKETING") return true;
    if ((user?.role === "FINANCE_APPROVER" || user?.role === "CHARTERED_ACCOUNTANT") && item.division === "FINANCE") return true;
    return false;
  }

  function handleApprove(id: string) {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "APPROVED",
              approvedBy: `${user?.name} (${user?.role.replace(/_/g, " ")})`,
            }
          : a
      )
    );

    const logged = logStaffActivity({
      division: item.division,
      title: `Executive Sign-off: "${item.title}"`,
      actor: user?.name || "Staff Lead",
      actorRole: user?.role.replace(/_/g, " ") || "Leader",
      badgeColor: "bg-emerald-100 text-emerald-900",
      details: `Sign-off completed by ${user?.name} (${user?.role.replace(/_/g, " ")}). Approved for production release.`,
    });
    setActivities((prev) => [logged, ...prev.filter((a) => a.id !== logged.id)]);

    toast.success(`Approved: "${item.title}"`);
  }

  function handleReject(id: string) {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "REJECTED",
              approvedBy: `Rejected by ${user?.name}`,
            }
          : a
      )
    );

    const logged = logStaffActivity({
      division: item.division,
      title: `Revision Requested: "${item.title}"`,
      actor: user?.name || "Staff Lead",
      actorRole: user?.role.replace(/_/g, " ") || "Leader",
      badgeColor: "bg-rose-100 text-rose-900",
      details: `Revision requested by ${user?.name}. Team must address feedback and resubmit.`,
    });
    setActivities((prev) => [logged, ...prev.filter((a) => a.id !== logged.id)]);

    toast.error(`Returned with feedback: "${item.title}"`);
  }

  const filteredApprovals = approvals.filter((item) => {
    if (divisionFilter === "ALL") return true;
    return item.division === divisionFilter;
  });

  const pendingCount = approvals.filter((a) => a.status === "PENDING").length;

  const filteredActivities = activities.filter((act) => {
    const matchesDiv = activityDivisionFilter === "ALL" || act.division === activityDivisionFilter;
    const matchesQuery =
      activitySearch.trim() === "" ||
      act.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      act.actor.toLowerCase().includes(activitySearch.toLowerCase()) ||
      act.actorRole.toLowerCase().includes(activitySearch.toLowerCase()) ||
      (act.details && act.details.toLowerCase().includes(activitySearch.toLowerCase()));
    return matchesDiv && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-navy via-brand-steel to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gold">
            <Shield className="h-4 w-4" />
            Balasuriya Group Management Portal & Executive Governance
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Executive Control Desk: {user?.name}
          </h1>
          <p className="mt-2 text-xs text-white/80 max-w-2xl leading-relaxed">
            Welcome to the internal corporate operations console. Authorized for role:{" "}
            <span className="font-bold text-white uppercase">{user?.role.replace(/_/g, " ")}</span>.
            {isOwnerOrAdmin
              ? " As an Executive Board Member, you possess universal authority across all corporate divisions, delegated approvals, and real-time audit governance."
              : " Review division tasks, approve submissions from your team members, and coordinate with Executive Directors."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href="#staff-activities"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition backdrop-blur-sm shadow-xs"
            >
              <Activity className="h-3.5 w-3.5 text-brand-gold" />
              Live Staff Activity Feed ({activities.length} Events)
            </a>
            <a
              href="#approval-queue"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition backdrop-blur-sm"
            >
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              Approvals Queue ({pendingCount} Pending)
            </a>
            {canManageStaff && (
              <Link
                to="/staff/users"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-brand-navy transition shadow-xs"
              >
                <Users className="h-3.5 w-3.5" />
                Staff Hierarchy & Directory
              </Link>
            )}
          </div>
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
            <span className="block text-2xl font-bold text-brand-navy">{pendingCount} Items</span>
            <span className="text-xs text-gray-500">Pending Review Queue</span>
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

      {/* Section 1: Division Draft Review & Approval Hierarchy */}
      <div id="approval-queue" className="card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-brand-steel" />
              <h2 className="font-display font-bold text-lg text-brand-navy">
                Division Approval & Sign-off Queue
              </h2>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Junior staff submissions require review. Division Leaders can approve items for their division; Executive Directors & CEO hold master approval and override authority.
            </p>
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400 mr-1 shrink-0" />
            {["ALL", "CONSTRUCTION", "SOFTWARE", "TOURISM", "TICKETING", "FINANCE"].map((div) => (
              <button
                key={div}
                type="button"
                onClick={() => setDivisionFilter(div)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 ${
                  divisionFilter === div
                    ? "bg-brand-navy text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {div === "ALL" ? "All Divisions" : div.charAt(0) + div.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredApprovals.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No approval requests matching selected division.
            </div>
          ) : (
            filteredApprovals.map((item) => {
              const userPermitted = canUserApprove(item);
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition ${
                    item.status === "APPROVED"
                      ? "border-emerald-200 bg-emerald-50/40"
                      : item.status === "REJECTED"
                      ? "border-rose-200 bg-rose-50/40"
                      : "border-gray-200 bg-white hover:border-gray-300 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                          {item.divisionTitle}
                        </span>
                        {item.urgency === "HIGH" && (
                          <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            High Priority
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.submittedAt}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-brand-navy">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
                        <span>Submitted by:</span>
                        <span className="font-semibold text-brand-navy">{item.submittedBy}</span>
                        <span className="text-gray-400">({item.submitterRole})</span>
                      </div>
                    </div>

                    {/* Actions / Status */}
                    <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0">
                      {item.status === "PENDING" ? (
                        userPermitted ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReject(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                              <X className="h-3.5 w-3.5 text-rose-600" />
                              Reject / Revise
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {isOwnerOrAdmin ? "Executive Sign-off" : "Leader Approve"}
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            Awaiting {item.divisionTitle} Leader Sign-off
                          </div>
                        )
                      ) : item.status === "APPROVED" ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Approved: {item.approvedBy}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                          {item.approvedBy || "Returned for Revision"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Executive Cross-Division Activity Log & Audit Stream */}
      <div id="staff-activities" className="card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-gold" />
              <h2 className="font-display font-bold text-lg text-brand-navy">
                Executive Governance & Live Activity Feed
              </h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Live Audit Stream
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Complete audit trail of real-time actions taken by staff, division leaders, and executive directors across all corporate departments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
              {filteredActivities.length} of {activities.length} Events
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by staff name, action, role..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="input pl-9 text-xs py-2 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-gray-400 mr-1 shrink-0" />
            {["ALL", "CONSTRUCTION", "SOFTWARE", "TOURISM", "TICKETING", "FINANCE", "GOVERNANCE"].map((div) => (
              <button
                key={div}
                type="button"
                onClick={() => setActivityDivisionFilter(div)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 ${
                  activityDivisionFilter === div
                    ? "bg-brand-navy text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {div === "ALL" ? "All Divisions" : div.charAt(0) + div.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto pr-1">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 space-y-1">
              <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-600">No staff activities match the criteria.</p>
              <p className="text-[11px]">Try clearing your search query or selecting "All Divisions".</p>
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-gray-50/60 rounded-xl px-2 transition">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${act.badgeColor}`}>
                      {act.division}
                    </span>
                    <span className="text-xs font-semibold text-brand-navy">{act.title}</span>
                  </div>
                  {act.details && (
                    <p className="text-xs text-gray-600 leading-relaxed pl-0.5">
                      {act.details}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 pl-0.5">
                    Executed by <span className="font-semibold text-gray-800">{act.actor}</span>{" "}
                    <span className="text-gray-400">({act.actorRole})</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                    <Clock className="h-3 w-3" /> {act.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
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

          {(isOwnerOrAdmin || user?.role === "FINANCE_APPROVER" || user?.role === "CHARTERED_ACCOUNTANT") && (
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

          {canManageStaff && (
            <Link
              to="/staff/users"
              className="rounded-xl border border-gray-200 p-4 hover:border-brand-navy hover:bg-brand-surface transition group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-700 group-hover:text-brand-navy transition" />
                <div>
                  <span className="block font-semibold text-xs text-brand-navy">
                    {isOwnerOrAdmin ? "Staff & Access Hierarchy" : "Manage Division Team"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {isOwnerOrAdmin
                      ? "Universal staff provisioning, passwords & roles"
                      : "Add & manage staff for your division"}
                  </span>
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
