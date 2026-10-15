export interface ActivityEvent {
  id: string;
  division: "CONSTRUCTION" | "TOURISM" | "SOFTWARE" | "TICKETING" | "FINANCE" | "GOVERNANCE";
  title: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  badgeColor: string;
  details?: string;
}

export const INITIAL_ACTIVITY_STREAM: ActivityEvent[] = [
  {
    id: "act-1",
    division: "GOVERNANCE",
    title: "Executive Staff Hierarchy updated with delegated division authority",
    actor: "Mr. Clemon Balasuriya",
    actorRole: "Group Chairman & CEO",
    timestamp: "10 mins ago",
    badgeColor: "bg-brand-navy text-brand-gold",
    details: "Configured multi-division leadership permissions and automated email dispatches",
  },
  {
    id: "act-2",
    division: "CONSTRUCTION",
    title: "Updated Site Progress for Kandy Luxury Hillside Villa to 62%",
    actor: "Mr. Migara Fonseka",
    actorRole: "Head of Construction & Engineering",
    timestamp: "45 mins ago",
    badgeColor: "bg-blue-100 text-blue-900",
    details: "Completed structural column reinforcement and slab curing inspection",
  },
  {
    id: "act-3",
    division: "FINANCE",
    title: "Verified direct corporate bank deposit #DEP-9042 (LKR 850,000)",
    actor: "Mr. Clavo Balasuriya",
    actorRole: "Executive Director & Finance",
    timestamp: "2 hours ago",
    badgeColor: "bg-amber-100 text-amber-900",
    details: "Commercial warehouse advance payment slip confirmed against bank statement",
  },
  {
    id: "act-4",
    division: "TOURISM",
    title: "Published 7-Day Hill Country Luxury Tea Trail package (-15%)",
    actor: "Mr. Damian Balasuriya",
    actorRole: "Head of Tourism & Global Travel",
    timestamp: "3 hours ago",
    badgeColor: "bg-emerald-100 text-emerald-900",
    details: "Winter season promotion launched across Ella, Nuwara Eliya and Kandy",
  },
  {
    id: "act-5",
    division: "SOFTWARE",
    title: "Deployed automated client quotation estimator v2.4 to cloud",
    actor: "Mr. Pasindu Hansana",
    actorRole: "Head of Software Solutions",
    timestamp: "Yesterday, 6:00 PM",
    badgeColor: "bg-indigo-100 text-indigo-900",
    details: "Released multi-tenant estimation engine and automated email dispatches",
  },
  {
    id: "act-6",
    division: "TICKETING",
    title: "Authorized Corporate Group PNR for MAS Holdings (14 Pax)",
    actor: "Mr. Shenal Fernando",
    actorRole: "Head of Air Ticketing & Global Desk",
    timestamp: "Yesterday, 3:30 PM",
    badgeColor: "bg-sky-100 text-sky-900",
    details: "Colombo - Singapore - Tokyo round-trip corporate discount rate issued",
  },
];

const ACTIVITY_STORAGE_KEY = "bg_staff_activity_stream";

export function getStoredActivities(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_ACTIVITY_STREAM;
}

export function logStaffActivity(params: {
  division: "CONSTRUCTION" | "TOURISM" | "SOFTWARE" | "TICKETING" | "FINANCE" | "GOVERNANCE";
  title: string;
  actor: string;
  actorRole: string;
  badgeColor?: string;
  details?: string;
  timestamp?: string;
}): ActivityEvent {
  const defaultColors: Record<string, string> = {
    CONSTRUCTION: "bg-blue-100 text-blue-900",
    TOURISM: "bg-emerald-100 text-emerald-900",
    SOFTWARE: "bg-indigo-100 text-indigo-900",
    TICKETING: "bg-sky-100 text-sky-900",
    FINANCE: "bg-amber-100 text-amber-900",
    GOVERNANCE: "bg-brand-navy text-brand-gold",
  };

  const newEntry: ActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    division: params.division,
    title: params.title,
    actor: params.actor,
    actorRole: params.actorRole,
    timestamp: params.timestamp || "Just now",
    badgeColor: params.badgeColor || defaultColors[params.division] || "bg-gray-100 text-gray-800",
    details: params.details,
  };

  try {
    const current = getStoredActivities();
    const updated = [newEntry, ...current.slice(0, 59)];
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("bg_staff_activity_added", { detail: newEntry }));
  } catch {}

  return newEntry;
}
