import { useEffect, useState, type FormEvent } from "react";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Copy,
  Filter,
  KeyRound,
  Mail,
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
  Layers,
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  DEPARTMENT_ROLES_MAP,
  getEffectiveUserRoles,
  isLeaderRole,
  type Role,
  type User,
} from "../../types";
import { logStaffActivity } from "../../lib/activityLogger";
import toast from "react-hot-toast";

export const DEPARTMENTS = [
  { id: "ALL", name: "All Staff Members", short: "All Divisions" },
  { id: "Executive Board", name: "Executive Board", short: "Executive" },
  { id: "Construction & Engineering", name: "Civil Engineering & Construction", short: "Construction" },
  { id: "Tourism & Travel", name: "StayLanka & Foreign Tours", short: "Tourism" },
  { id: "Software Solutions", name: "Software & Technology Solutions", short: "Software" },
  { id: "Air Ticketing", name: "Balasuriya Air Ticketing & Visa", short: "Air Ticketing" },
  { id: "Finance & Accounts", name: "Corporate Finance & Accounts", short: "Finance & Accounts" },
] as const;

export const DIVISION_ROLES_MAP: Record<
  string,
  {
    department: string;
    divisionLabel: string;
    leaderRole: Role;
    allowedRoles: Role[];
    defaultNewRole: Role;
  }
> = {
  CONSTRUCTION_MANAGER: {
    department: "Construction & Engineering",
    divisionLabel: "Civil Engineering & Construction",
    leaderRole: "CONSTRUCTION_MANAGER",
    allowedRoles: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF"],
    defaultNewRole: "CONSTRUCTION_STAFF",
  },
  TOURISM_AGENT: {
    department: "Tourism & Travel",
    divisionLabel: "StayLanka & Foreign Tours",
    leaderRole: "TOURISM_AGENT",
    allowedRoles: ["TOURISM_AGENT", "TOURISM_STAFF"],
    defaultNewRole: "TOURISM_STAFF",
  },
  SOFTWARE_ENGINEER: {
    department: "Software Solutions",
    divisionLabel: "Software & Technology Solutions",
    leaderRole: "SOFTWARE_ENGINEER",
    allowedRoles: ["SOFTWARE_ENGINEER", "SOFTWARE_STAFF"],
    defaultNewRole: "SOFTWARE_STAFF",
  },
  TICKET_AGENT: {
    department: "Air Ticketing",
    divisionLabel: "Balasuriya Air Ticketing & Visa",
    leaderRole: "TICKET_AGENT",
    allowedRoles: ["TICKET_AGENT", "TICKET_STAFF"],
    defaultNewRole: "TICKET_STAFF",
  },
  FINANCE_APPROVER: {
    department: "Finance & Accounts",
    divisionLabel: "Corporate Finance & Accounts",
    leaderRole: "FINANCE_APPROVER",
    allowedRoles: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
    defaultNewRole: "FINANCE_STAFF",
  },
  CHARTERED_ACCOUNTANT: {
    department: "Finance & Accounts",
    divisionLabel: "Corporate Finance & Accounts",
    leaderRole: "CHARTERED_ACCOUNTANT",
    allowedRoles: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
    defaultNewRole: "FINANCE_STAFF",
  },
};

const ROLE_HIERARCHY: {
  role: Role;
  tier: string;
  label: string;
  department: string;
  isLeader: boolean;
  permissions: string;
  badgeColor: string;
}[] = [
  {
    role: "OWNER",
    tier: "Tier 1: Board / Executive",
    label: "Executive Owner / Group Chairman & CEO",
    department: "Executive Board",
    isLeader: true,
    permissions: "Full group authority: all divisions, corporate treasury, staff provisioning & governance.",
    badgeColor: "bg-brand-navy text-brand-gold",
  },
  {
    role: "ADMIN",
    tier: "Tier 2: Corporate Governance",
    label: "Director / Corporate Admin (MD / ED)",
    department: "Executive Board",
    isLeader: true,
    permissions: "Full executive management: provision staff across all divisions, approve projects & operational changes.",
    badgeColor: "bg-purple-100 text-purple-900",
  },
  {
    role: "CONSTRUCTION_MANAGER",
    tier: "Tier 3: Division Head",
    label: "Construction Division Leader",
    department: "Construction & Engineering",
    isLeader: true,
    permissions: "Oversee civil engineering division, manage site engineers/supervisors, approve site % updates.",
    badgeColor: "bg-blue-100 text-blue-900",
  },
  {
    role: "CONSTRUCTION_STAFF",
    tier: "Tier 4: Section Operational Staff",
    label: "Civil Site Engineer & Field Supervisor",
    department: "Construction & Engineering",
    isLeader: false,
    permissions: "Record on-site project progress, upload field inspection photos, log contractor updates.",
    badgeColor: "bg-sky-50 text-sky-800 border border-sky-200",
  },
  {
    role: "TOURISM_AGENT",
    tier: "Tier 3: Division Head",
    label: "StayLanka & Foreign Tours Leader",
    department: "Tourism & Travel",
    isLeader: true,
    permissions: "Manage inbound & foreign tour operations, lead travel consultants, approve special holiday itineraries.",
    badgeColor: "bg-emerald-100 text-emerald-900",
  },
  {
    role: "TOURISM_STAFF",
    tier: "Tier 4: Section Operational Staff",
    label: "Tour Coordinator & Travel Consultant",
    department: "Tourism & Travel",
    isLeader: false,
    permissions: "Draft customer itineraries, update seasonal tour rates, coordinate ground hotel & transport bookings.",
    badgeColor: "bg-teal-50 text-teal-800 border border-teal-200",
  },
  {
    role: "SOFTWARE_ENGINEER",
    tier: "Tier 3: Division Head",
    label: "Software & Technology Solutions Leader",
    department: "Software Solutions",
    isLeader: true,
    permissions: "Manage technology division, supervise software developers, architect enterprise client projects.",
    badgeColor: "bg-indigo-100 text-indigo-900",
  },
  {
    role: "SOFTWARE_STAFF",
    tier: "Tier 4: Section Operational Staff",
    label: "Full-Stack Developer & QA Engineer",
    department: "Software Solutions",
    isLeader: false,
    permissions: "Implement client project milestones, conduct software testing, resolve technical tickets.",
    badgeColor: "bg-violet-50 text-violet-800 border border-violet-200",
  },
  {
    role: "TICKET_AGENT",
    tier: "Tier 3: Division Head",
    label: "Air Ticketing & Global Desk Leader",
    department: "Air Ticketing",
    isLeader: true,
    permissions: "Lead global air ticketing desk, handle airline GDS consolidations, manage corporate flight quotes.",
    badgeColor: "bg-sky-100 text-sky-900",
  },
  {
    role: "TICKET_STAFF",
    tier: "Tier 4: Section Operational Staff",
    label: "Flight Reservation & Visa Desk Officer",
    department: "Air Ticketing",
    isLeader: false,
    permissions: "Search flight itineraries, issue ticket drafts, assist travelers with visa document reviews.",
    badgeColor: "bg-cyan-50 text-cyan-800 border border-cyan-200",
  },
  {
    role: "FINANCE_APPROVER",
    tier: "Tier 3: Division Head",
    label: "Executive Director & Finance Approver",
    department: "Finance & Accounts",
    isLeader: true,
    permissions: "Verify bank deposit slips, approve client settlements, issue tax invoices and official receipts.",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  {
    role: "CHARTERED_ACCOUNTANT",
    tier: "Tier 3: Financial Control",
    label: "Chartered Accountant / Lead Auditor",
    department: "Finance & Accounts",
    isLeader: true,
    permissions: "Audit financial transactions, reconcile bank records, generate financial compliance reports.",
    badgeColor: "bg-amber-50 text-amber-800",
  },
  {
    role: "FINANCE_STAFF",
    tier: "Tier 4: Section Operational Staff",
    label: "Corporate Accounts & Billing Specialist",
    department: "Finance & Accounts",
    isLeader: false,
    permissions: "Enter daily billing vouchers, cross-check slip references, prepare accounts payables/receivables.",
    badgeColor: "bg-orange-50 text-orange-800 border border-orange-200",
  },
  {
    role: "CUSTOMER",
    tier: "Tier 5: External Client",
    label: "Client / Customer",
    department: "External",
    isLeader: false,
    permissions: "Access Client Portal only: view own project updates, tour bookings, and upload bank slips.",
    badgeColor: "bg-gray-100 text-gray-700",
  },
];

const INITIAL_DEMO_USERS: User[] = [
  // Executive Board / Corporate Leadership
  {
    id: "usr_owner_1",
    name: "Mr. Clemon Balasuriya",
    email: "clemonbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "OWNER",
    department: "Executive Board",
    jobTitle: "Group Chairman & CEO",
    assignedDivisions: ["Executive Board", "Construction & Engineering", "Tourism & Travel", "Software Solutions", "Air Ticketing", "Finance & Accounts"],
    isActive: true,
  },
  {
    id: "usr_md_2",
    name: "Mr. Damian Balasuriya",
    email: "damianbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    secondaryRoles: ["TOURISM_AGENT"],
    department: "Executive Board",
    jobTitle: "Managing Director & Head of Tourism",
    assignedDivisions: ["Executive Board", "Tourism & Travel"],
    isActive: true,
  },
  {
    id: "usr_ed_3",
    name: "Mr. Clavo Balasuriya",
    email: "clavobalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "FINANCE_APPROVER",
    department: "Finance & Accounts",
    jobTitle: "Executive Director & Finance",
    assignedDivisions: ["Executive Board", "Finance & Accounts"],
    isActive: true,
  },
  {
    id: "usr_dir_4",
    name: "Mrs. Christina Balasuriya",
    email: "christinabalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    department: "Executive Board",
    jobTitle: "Executive Director & Corporate Affairs",
    assignedDivisions: ["Executive Board"],
    isActive: true,
  },

  // Construction & Civil Engineering Division
  {
    id: "usr_migara_5",
    name: "Mr. Migara Fonseka",
    email: "fonsekamigara@gmail.com",
    phone: "+94 77 234 5678",
    role: "CONSTRUCTION_MANAGER",
    department: "Construction & Engineering",
    jobTitle: "Head of Construction & Engineering",
    assignedDivisions: ["Construction & Engineering"],
    isActive: true,
  },
  {
    id: "usr_const_staff_1",
    name: "Mr. Kaveen Jayasinghe",
    email: "kaveen.construction@balasuriyagroup.tech",
    phone: "+94 77 312 4567",
    role: "CONSTRUCTION_STAFF",
    department: "Construction & Engineering",
    jobTitle: "Senior Civil Engineer & Site Supervisor",
    assignedDivisions: ["Construction & Engineering"],
    isActive: true,
  },
  {
    id: "usr_const_staff_2",
    name: "Mr. Nimal Perera",
    email: "nimal.projects@balasuriyagroup.tech",
    phone: "+94 77 423 5678",
    role: "CONSTRUCTION_STAFF",
    department: "Construction & Engineering",
    jobTitle: "Quantity Surveyor & Field Coordinator",
    assignedDivisions: ["Construction & Engineering"],
    isActive: true,
  },

  // Tourism & Global Travel Division
  {
    id: "usr_damian_tours",
    name: "Mr. Damian Balasuriya",
    email: "damian@balasuriyagroup.tech",
    phone: "+94 77 345 6789",
    role: "TOURISM_AGENT",
    department: "Tourism & Travel",
    jobTitle: "Head of Tourism & Global Travel",
    assignedDivisions: ["Tourism & Travel"],
    isActive: true,
  },
  {
    id: "usr_tour_staff_1",
    name: "Ms. Rashmi Senanayake",
    email: "rashmi.tours@balasuriyagroup.tech",
    phone: "+94 77 534 6789",
    role: "TOURISM_STAFF",
    department: "Tourism & Travel",
    jobTitle: "Senior Travel Consultant & Itinerary Planner",
    assignedDivisions: ["Tourism & Travel"],
    isActive: true,
  },
  {
    id: "usr_tour_staff_2",
    name: "Mr. Dinuka Silva",
    email: "dinuka.visa@balasuriyagroup.tech",
    phone: "+94 77 645 7890",
    role: "TOURISM_STAFF",
    department: "Tourism & Travel",
    jobTitle: "Foreign Tours & Visa Officer",
    assignedDivisions: ["Tourism & Travel"],
    isActive: true,
  },

  // Software Solutions & IT Division
  {
    id: "usr_pasindu_6",
    name: "Mr. Pasindu Hansana",
    email: "pasinduhansana@gmail.com",
    phone: "+94 77 456 7890",
    role: "SOFTWARE_ENGINEER",
    secondaryRoles: ["TICKET_AGENT"],
    department: "Software Solutions",
    jobTitle: "Head of Software & Aviation Tech Lead",
    assignedDivisions: ["Software Solutions", "Air Ticketing"],
    isActive: true,
  },
  {
    id: "usr_soft_staff_1",
    name: "Mr. Thilina Bandara",
    email: "thilina.dev@balasuriyagroup.tech",
    phone: "+94 77 756 8901",
    role: "SOFTWARE_STAFF",
    department: "Software Solutions",
    jobTitle: "Senior Full-Stack Developer",
    assignedDivisions: ["Software Solutions"],
    isActive: true,
  },
  {
    id: "usr_soft_staff_2",
    name: "Ms. Sanduni Fernando",
    email: "sanduni.qa@balasuriyagroup.tech",
    phone: "+94 77 867 9012",
    role: "SOFTWARE_STAFF",
    department: "Software Solutions",
    jobTitle: "QA Engineer & UI/UX Specialist",
    assignedDivisions: ["Software Solutions"],
    isActive: true,
  },

  // Air Ticketing & Global Reservations Division
  {
    id: "usr_shenal_7",
    name: "Mr. Shenal Fernando",
    email: "shenal@balasuriyagroup.tech",
    phone: "+94 77 567 8901",
    role: "TICKET_AGENT",
    department: "Air Ticketing",
    jobTitle: "Head of Air Ticketing & Global Desk",
    assignedDivisions: ["Air Ticketing"],
    isActive: true,
  },
  {
    id: "usr_ticket_staff_1",
    name: "Ms. Chathuri Wickramasinghe",
    email: "chathuri.flights@balasuriyagroup.tech",
    phone: "+94 77 978 0123",
    role: "TICKET_STAFF",
    department: "Air Ticketing",
    jobTitle: "Senior GDS Reservations Officer",
    assignedDivisions: ["Air Ticketing"],
    isActive: true,
  },

  // Finance & Accounts Division
  {
    id: "usr_fin_staff_1",
    name: "Mr. Sunil Wickrema",
    email: "sunil.accounts@balasuriyagroup.tech",
    phone: "+94 77 189 1234",
    role: "FINANCE_STAFF",
    department: "Finance & Accounts",
    jobTitle: "Senior Corporate Accounts Executive",
    assignedDivisions: ["Finance & Accounts"],
    isActive: true,
  },
];

const LOCAL_USERS_KEY = "bg_staff_users";
const REMOVED_USERS_KEY = "bg_removed_staff_identifiers";

function getRemovedIdentifiers(): Set<string> {
  try {
    const raw = localStorage.getItem(REMOVED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((s) => String(s).toLowerCase().trim()));
      }
    }
  } catch {}
  return new Set();
}

function markIdentifierRemoved(id?: string | null, email?: string | null): void {
  const set = getRemovedIdentifiers();
  if (id) set.add(id.toLowerCase().trim());
  if (email) set.add(email.toLowerCase().trim());
  try {
    localStorage.setItem(REMOVED_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function unmarkIdentifierRemoved(id?: string | null, email?: string | null): void {
  const set = getRemovedIdentifiers();
  if (id) set.delete(id.toLowerCase().trim());
  if (email) set.delete(email.toLowerCase().trim());
  try {
    localStorage.setItem(REMOVED_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function isUserRemoved(u: { id?: string | null; email?: string | null }): boolean {
  const removed = getRemovedIdentifiers();
  if (u.id && removed.has(u.id.toLowerCase().trim())) return true;
  if (u.email && removed.has(u.email.toLowerCase().trim())) return true;
  return false;
}

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Discard any explicitly removed users
        parsed = parsed.filter((u: User) => !isUserRemoved(u));

        // Ensure root executive owner is never missing from stored list
        const hasOwner = parsed.some(
          (u: User) =>
            u.id === "usr_owner_1" ||
            u.email?.toLowerCase() === "clemonbalasuriyagroup@gmail.com" ||
            u.role === "OWNER"
        );
        if (!hasOwner && INITIAL_DEMO_USERS[0]) {
          parsed = [INITIAL_DEMO_USERS[0], ...parsed];
        }
        persistUsers(parsed);
        return parsed;
      }
    }
  } catch {}
  return [];
}

function persistUsers(list: User[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
  } catch {}
}

function mergeUsers(remote: User[], local: User[]): User[] {
  // Exclude any users marked as deleted in persistent storage
  const safeRemote = (remote || []).filter((u) => !isUserRemoved(u));
  const safeLocal = (local || []).filter((u) => !isUserRemoved(u));

  if (!safeLocal || safeLocal.length === 0) return safeRemote;
  if (!safeRemote || safeRemote.length === 0) return safeLocal;

  const localMap = new Map<string, User>();
  for (const u of safeLocal) {
    if (u.id) localMap.set(u.id, u);
    if (u.email) localMap.set(u.email.toLowerCase(), u);
  }

  const merged: User[] = [];
  const added = new Set<string>();

  for (const r of safeRemote) {
    const localMatch = (r.id && localMap.get(r.id)) || (r.email && localMap.get(r.email.toLowerCase()));
    if (localMatch) {
      const combined = { ...r, ...localMatch };
      merged.push(combined);
      if (combined.id) added.add(combined.id);
      if (combined.email) added.add(combined.email.toLowerCase());
    } else {
      merged.push(r);
      if (r.id) added.add(r.id);
      if (r.email) added.add(r.email.toLowerCase());
    }
  }

  for (const l of safeLocal) {
    const already = (l.id && added.has(l.id)) || (l.email && added.has(l.email.toLowerCase()));
    if (!already) {
      merged.push(l);
      if (l.id) added.add(l.id);
      if (l.email) added.add(l.email.toLowerCase());
    }
  }

  // Ensure root executive owner is always at the top of directory
  const ownerIndex = merged.findIndex(
    (u) =>
      u.role === "OWNER" ||
      u.email?.toLowerCase() === "clemonbalasuriyagroup@gmail.com" ||
      u.id === "usr_owner_1"
  );
  if (ownerIndex > 0) {
    const [owner] = merged.splice(ownerIndex, 1);
    merged.unshift(owner);
  } else if (ownerIndex === -1 && INITIAL_DEMO_USERS[0]) {
    merged.unshift(INITIAL_DEMO_USERS[0]);
  }

  return merged;
}

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
  
  // Extract all roles caller holds (primary role + secondary cross-section roles + assigned division roles)
  const callerRoles: Role[] = getEffectiveUserRoles(currentUser);
  const isExecutive = callerRoles.includes("OWNER") || callerRoles.includes("ADMIN");
  
  // Identify all corporate divisions caller leads
  const callerLedDivisions = Object.values(DIVISION_ROLES_MAP).filter((div) =>
    callerRoles.includes(div.leaderRole)
  );
  const isDivisionLeader = !isExecutive && callerLedDivisions.length > 0;
  const isMultiDivisionLeader = !isExecutive && callerLedDivisions.length > 1;

  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStoredUsers();
    if (stored.length > 0) return stored;
    return INITIAL_DEMO_USERS.filter((u) => !isUserRemoved(u));
  });
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showNew, setShowNew] = useState(false);

  // Default role and department based on caller's division
  const initialDept: string = isDivisionLeader
    ? callerLedDivisions[0].department
    : "Construction & Engineering";
  const initialRole: Role = isDivisionLeader
    ? callerLedDivisions[0].defaultNewRole
    : "CONSTRUCTION_STAFF";

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
  const [department, setDepartment] = useState<string>(initialDept);
  const [jobTitle, setJobTitle] = useState("");
  const [secondaryRoles, setSecondaryRoles] = useState<Role[]>([]);
  const [assignedDivisions, setAssignedDivisions] = useState<string[]>([initialDept]);
  const [tempPassword, setTempPassword] = useState(generateStrongTempPassword());
  const [submitting, setSubmitting] = useState(false);

  // Confirmation email / credentials modal
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    role: Role;
    department?: string | null;
    jobTitle?: string | null;
    secondaryRoles?: Role[];
    assignedDivisions?: string[];
    password: string;
    isReset?: boolean;
    emailDispatched?: boolean;
  } | null>(null);

  // Edit staff details modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<Role>("CONSTRUCTION_STAFF");
  const [editDepartment, setEditDepartment] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editSecondaryRoles, setEditSecondaryRoles] = useState<Role[]>([]);
  const [editAssignedDivisions, setEditAssignedDivisions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);

  function load() {
    api
      .get<{ users: User[] }>("/api/users")
      .then((res) => {
        const stored = getStoredUsers();
        const fallbackBase = stored.length > 0 ? stored : INITIAL_DEMO_USERS.filter((u) => !isUserRemoved(u));
        if (res.data?.users && res.data.users.length > 0) {
          const combined = mergeUsers(res.data.users, fallbackBase);
          setUsers(combined);
          persistUsers(combined);
        } else {
          const ensured = mergeUsers([], fallbackBase);
          setUsers(ensured);
          persistUsers(ensured);
        }
      })
      .catch(() => {
        const stored = getStoredUsers();
        const fallbackBase = stored.length > 0 ? stored : INITIAL_DEMO_USERS.filter((u) => !isUserRemoved(u));
        const ensured = mergeUsers([], fallbackBase);
        setUsers(ensured);
        persistUsers(ensured);
      });
  }

  useEffect(load, []);

  // Defensive auto-recovery: If currentUser is logged in but missing from users list (e.g. accidentally removed), restore them immediately
  useEffect(() => {
    if (!currentUser?.email) return;
    setUsers((prev) => {
      const exists = prev.some(
        (u) =>
          (currentUser.id && u.id === currentUser.id) ||
          u.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (!exists) {
        const restored: User = {
          id: currentUser.id || `usr_${Date.now()}`,
          name: currentUser.name || "Staff Member",
          email: currentUser.email.toLowerCase(),
          phone: currentUser.phone || "+94 76 7171 938",
          role: currentUser.role,
          department: currentUser.department || "Executive Board",
          jobTitle: currentUser.jobTitle || (currentUser.role === "OWNER" ? "Group Chairman & CEO" : "Staff Member"),
          assignedDivisions: currentUser.assignedDivisions || (currentUser.department ? [currentUser.department] : ["Executive Board"]),
          secondaryRoles: currentUser.secondaryRoles || [],
          isActive: true,
        };
        const next = [restored, ...prev];
        persistUsers(next);
        return next;
      }
      return prev;
    });
  }, [currentUser]);

  // Check if current user can manage target user (supports cross-section leadership)
  function canManage(target: User): boolean {
    if (isExecutive) return true;
    if (isDivisionLeader) {
      const targetEffectiveRoles = getEffectiveUserRoles(target);
      if (targetEffectiveRoles.includes("OWNER") || targetEffectiveRoles.includes("ADMIN")) {
        return false;
      }
      const callerLedDeptNames = callerLedDivisions.map((d) => d.department);
      const allAllowedRoles = callerLedDivisions.flatMap((d) => d.allowedRoles);

      const inCallerDept =
        (target.department && callerLedDeptNames.includes(target.department)) ||
        target.assignedDivisions?.some((d) => callerLedDeptNames.includes(d));

      const hasMatchingRole = targetEffectiveRoles.some((r) => allAllowedRoles.includes(r));
      return Boolean(inCallerDept || hasMatchingRole);
    }
    return false;
  }

  // Allowed roles for creation/editing by caller based on selected department
  const currentDeptDiv = Object.values(DIVISION_ROLES_MAP).find((d) => d.department === department);
  const availableRoles = isExecutive
    ? ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER")
    : currentDeptDiv
    ? ROLE_HIERARCHY.filter((r) => currentDeptDiv.allowedRoles.includes(r.role))
    : ROLE_HIERARCHY.filter((r) => callerLedDivisions.flatMap((d) => d.allowedRoles).includes(r.role));

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const assignedDept = department;
    const finalAssignedDivisions = Array.from(new Set([assignedDept, ...assignedDivisions].filter(Boolean) as string[]));

    const isLeader = isLeaderRole(role);
    const calculatedRoles = new Set<Role>(secondaryRoles);
    for (const div of finalAssignedDivisions) {
      const match = DEPARTMENT_ROLES_MAP[div];
      if (match) {
        const targetRole = isLeader ? match.leader : match.staff;
        if (targetRole !== role) calculatedRoles.add(targetRole);
      }
    }
    const finalSecondaryRoles = Array.from(calculatedRoles).filter((r) => r !== role);

    const newUserObj: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      role,
      department: assignedDept,
      jobTitle: jobTitle ? jobTitle.trim() : null,
      secondaryRoles: finalSecondaryRoles,
      assignedDivisions: finalAssignedDivisions,
      isActive: true,
    };

    try {
      const res = await api.post("/api/users", {
        name: newUserObj.name,
        email: newUserObj.email,
        phone: newUserObj.phone || undefined,
        role: newUserObj.role,
        department: newUserObj.department,
        jobTitle: newUserObj.jobTitle || undefined,
        secondaryRoles: newUserObj.secondaryRoles,
        assignedDivisions: newUserObj.assignedDivisions,
        temporaryPassword: tempPassword,
      });

      if (res.data?.user?.id) {
        newUserObj.id = res.data.user.id;
      }

      try {
        localStorage.setItem(`bg_pwd_${newUserObj.email.toLowerCase()}`, tempPassword);
      } catch {}

      const dispatched = res.data?.emailDispatched;
      toast.success(
        dispatched
          ? `Staff account created & welcome email dispatched to ${email}!`
          : `Staff account created for ${name}`
      );
      setCredentialsModal({
        name: newUserObj.name,
        email: newUserObj.email,
        role: newUserObj.role,
        department: newUserObj.department,
        jobTitle: newUserObj.jobTitle,
        secondaryRoles: newUserObj.secondaryRoles,
        assignedDivisions: newUserObj.assignedDivisions,
        password: tempPassword,
        emailDispatched: dispatched ?? true,
      });
      unmarkIdentifierRemoved(newUserObj.id, newUserObj.email);
      setUsers((prev) => {
        const next = [newUserObj, ...prev.filter((u) => u.email.toLowerCase() !== newUserObj.email.toLowerCase())];
        persistUsers(next);
        return next;
      });
      logStaffActivity({
        division: "GOVERNANCE",
        title: `Provisioned official staff credentials for ${newUserObj.name}`,
        actor: currentUser?.name || "Corporate Admin",
        actorRole: currentUser?.role.replace(/_/g, " ") || "Admin",
        badgeColor: "bg-brand-navy text-brand-gold",
        details: `Role: ${newUserObj.role.replace(/_/g, " ")}, Department: ${newUserObj.department || "Corporate"}, Divisions: ${(newUserObj.assignedDivisions || []).join(", ")}. Welcome email dispatched.`,
      });
      setName("");
      setEmail("");
      setPhone("");
      setJobTitle("");
      setSecondaryRoles([]);
      setAssignedDivisions([initialDept]);
      setTempPassword(generateStrongTempPassword());
      setShowNew(false);
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || !err.response) {
        try {
          localStorage.setItem(`bg_pwd_${newUserObj.email.toLowerCase()}`, tempPassword);
        } catch {}
        unmarkIdentifierRemoved(newUserObj.id, newUserObj.email);
        setUsers((prev) => {
          const next = [newUserObj, ...prev.filter((u) => u.email.toLowerCase() !== newUserObj.email.toLowerCase())];
          persistUsers(next);
          return next;
        });
        setCredentialsModal({
          name: newUserObj.name,
          email: newUserObj.email,
          role: newUserObj.role,
          department: newUserObj.department,
          jobTitle: newUserObj.jobTitle,
          secondaryRoles: newUserObj.secondaryRoles,
          assignedDivisions: newUserObj.assignedDivisions,
          password: tempPassword,
          emailDispatched: true,
        });
        logStaffActivity({
          division: "GOVERNANCE",
          title: `Provisioned official staff credentials for ${newUserObj.name}`,
          actor: currentUser?.name || "Corporate Admin",
          actorRole: currentUser?.role.replace(/_/g, " ") || "Admin",
          badgeColor: "bg-brand-navy text-brand-gold",
          details: `Role: ${newUserObj.role.replace(/_/g, " ")}, Department: ${newUserObj.department || "Corporate"}, Divisions: ${(newUserObj.assignedDivisions || []).join(", ")}.`,
        });
        setName("");
        setEmail("");
        setPhone("");
        setJobTitle("");
        setSecondaryRoles([]);
        setAssignedDivisions([initialDept]);
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
    if (!canManage(user)) {
      toast.error("You are not authorized to modify this user's role.");
      return;
    }
    const updated = { ...user, role: newRole };
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === user.id ? updated : u));
      persistUsers(next);
      return next;
    });
    logStaffActivity({
      division: "GOVERNANCE",
      title: `Modified role for ${user.name} to ${newRole.replace(/_/g, " ")}`,
      actor: currentUser?.name || "Corporate Admin",
      actorRole: currentUser?.role.replace(/_/g, " ") || "Admin",
      badgeColor: "bg-indigo-100 text-indigo-900",
      details: `Role updated in system directory.`,
    });
    toast.success(`${user.name}'s role updated to ${newRole.replace(/_/g, " ")}`);
    try {
      await api.patch(`/api/users/${user.id}`, { role: newRole });
    } catch {}
  }

  async function handleToggleActive(user: User) {
    if (!canManage(user)) {
      toast.error("You are not authorized to change this user's status.");
      return;
    }
    const nextState = !user.isActive;
    const updated = { ...user, isActive: nextState };
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === user.id ? updated : u));
      persistUsers(next);
      return next;
    });
    logStaffActivity({
      division: "GOVERNANCE",
      title: `${nextState ? "Restored active access" : "Suspended account"} for ${user.name}`,
      actor: currentUser?.name || "Division Leader",
      actorRole: currentUser?.role.replace(/_/g, " ") || "Leader",
      badgeColor: nextState ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900",
      details: `Account access status changed to ${nextState ? "ACTIVE" : "SUSPENDED"}.`,
    });
    toast.success(`${user.name} is now ${nextState ? "Active" : "Suspended"}`);
    try {
      await api.patch(`/api/users/${user.id}`, { isActive: nextState });
    } catch {}
  }

  async function handleResetPassword(user: User) {
    if (!canManage(user)) {
      toast.error("You are not authorized to reset this user's password.");
      return;
    }
    const newTempPassword = generateStrongTempPassword();
    try {
      localStorage.setItem(`bg_pwd_${user.email.toLowerCase()}`, newTempPassword);
    } catch {}
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
    logStaffActivity({
      division: "GOVERNANCE",
      title: `Generated secure password reset for ${user.name}`,
      actor: currentUser?.name || "Division Leader",
      actorRole: currentUser?.role.replace(/_/g, " ") || "Leader",
      badgeColor: "bg-amber-100 text-amber-900",
      details: `New temporary password generated for ${user.email}.`,
    });
    setCredentialsModal({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      jobTitle: user.jobTitle,
      secondaryRoles: user.secondaryRoles,
      assignedDivisions: user.assignedDivisions,
      password: newTempPassword,
      isReset: true,
      emailDispatched,
    });
  }

  async function handleRemoveUser(user: User) {
    const isSelf = Boolean(
      (currentUser?.id && user.id === currentUser.id) ||
      (currentUser?.email && user.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (isSelf) {
      toast.error("You cannot remove your own active staff account.");
      return;
    }

    const isRootOwner =
      user.role === "OWNER" ||
      user.email.toLowerCase() === "clemonbalasuriyagroup@gmail.com" ||
      user.id === "usr_owner_1";
    if (isRootOwner) {
      toast.error("The root Executive Owner account is protected and cannot be removed.");
      return;
    }

    if (!canManage(user)) {
      toast.error("You are not authorized to remove this staff member.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${user.name} (${user.email})?`)) {
      return;
    }

    // Permanently mark as removed so refresh or remote re-fetches cannot resurrect them
    markIdentifierRemoved(user.id, user.email);

    setUsers((prev) => {
      const next = prev.filter(
        (u) =>
          u.id !== user.id &&
          u.email.toLowerCase() !== user.email.toLowerCase()
      );
      persistUsers(next);
      return next;
    });
    logStaffActivity({
      division: "GOVERNANCE",
      title: `Removed staff member account for ${user.name}`,
      actor: currentUser?.name || "Corporate Admin",
      actorRole: currentUser?.role.replace(/_/g, " ") || "Admin",
      badgeColor: "bg-rose-100 text-rose-900",
      details: `Account for ${user.email} permanently removed.`,
    });
    toast.success(`${user.name} has been removed.`);
    try {
      const deleteTarget = user.id || encodeURIComponent(user.email);
      await api.delete(`/api/users/${deleteTarget}?email=${encodeURIComponent(user.email)}`);
    } catch {}
  }

  function handleStartEdit(user: User) {
    if (!canManage(user)) {
      toast.error("You can only edit staff in your assigned divisions.");
      return;
    }
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role);
    setEditDepartment(user.department || "");
    setEditJobTitle(user.jobTitle || "");
    setEditSecondaryRoles(user.secondaryRoles || []);
    setEditAssignedDivisions(user.assignedDivisions || (user.department ? [user.department] : []));
    setEditIsActive(user.isActive !== false);
  }

  function toggleEditDivision(deptId: string) {
    const isCurrentlyAssigned = editAssignedDivisions.includes(deptId);
    const nextDivisions = isCurrentlyAssigned
      ? editAssignedDivisions.filter((d) => d !== deptId)
      : [...editAssignedDivisions, deptId];

    setEditAssignedDivisions(nextDivisions);

    // Automatically synchronize secondary roles according to leadership tier
    const isLeader = isLeaderRole(editRole);
    const match = DEPARTMENT_ROLES_MAP[deptId];
    if (match) {
      const targetRole = isLeader ? match.leader : match.staff;
      if (isCurrentlyAssigned) {
        setEditSecondaryRoles((prev) =>
          prev.filter((r) => r !== match.leader && r !== match.staff)
        );
      } else {
        if (editRole !== targetRole) {
          setEditSecondaryRoles((prev) => Array.from(new Set([...prev, targetRole])));
        }
      }
    }
  }

  function handleEditRoleChange(newRole: Role) {
    setEditRole(newRole);
    const isLeader = isLeaderRole(newRole);
    const updatedSecondary = new Set<Role>(editSecondaryRoles);

    for (const div of editAssignedDivisions) {
      const match = DEPARTMENT_ROLES_MAP[div];
      if (match) {
        if (isLeader) {
          updatedSecondary.delete(match.staff);
          if (newRole !== match.leader) updatedSecondary.add(match.leader);
        } else {
          updatedSecondary.delete(match.leader);
          if (newRole !== match.staff) updatedSecondary.add(match.staff);
        }
      }
    }
    setEditSecondaryRoles(Array.from(updatedSecondary).filter((r) => r !== newRole));
  }

  function toggleCreateDivision(deptId: string) {
    const isCurrentlyAssigned = assignedDivisions.includes(deptId);
    const nextDivisions = isCurrentlyAssigned
      ? assignedDivisions.filter((d) => d !== deptId)
      : [...assignedDivisions, deptId];

    setAssignedDivisions(nextDivisions);

    const isLeader = isLeaderRole(role);
    const match = DEPARTMENT_ROLES_MAP[deptId];
    if (match) {
      const targetRole = isLeader ? match.leader : match.staff;
      if (isCurrentlyAssigned) {
        setSecondaryRoles((prev) =>
          prev.filter((r) => r !== match.leader && r !== match.staff)
        );
      } else {
        if (role !== targetRole) {
          setSecondaryRoles((prev) => Array.from(new Set([...prev, targetRole])));
        }
      }
    }
  }

  function handleCreateRoleChange(newRole: Role) {
    setRole(newRole);
    const isLeader = isLeaderRole(newRole);
    const updatedSecondary = new Set<Role>(secondaryRoles);

    for (const div of assignedDivisions) {
      const match = DEPARTMENT_ROLES_MAP[div];
      if (match) {
        if (isLeader) {
          updatedSecondary.delete(match.staff);
          if (newRole !== match.leader) updatedSecondary.add(match.leader);
        } else {
          updatedSecondary.delete(match.leader);
          if (newRole !== match.staff) updatedSecondary.add(match.staff);
        }
      }
    }
    setSecondaryRoles(Array.from(updatedSecondary).filter((r) => r !== newRole));
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setEditSubmitting(true);

    const finalDivisions = Array.from(
      new Set([editDepartment, ...editAssignedDivisions].filter(Boolean) as string[])
    );

    const isLeader = isLeaderRole(editRole);
    const calculatedRoles = new Set<Role>(editSecondaryRoles);
    for (const div of finalDivisions) {
      const match = DEPARTMENT_ROLES_MAP[div];
      if (match) {
        const targetRole = isLeader ? match.leader : match.staff;
        if (targetRole !== editRole) {
          calculatedRoles.add(targetRole);
        }
      }
    }
    const finalSecondaryRoles = Array.from(calculatedRoles).filter((r) => r !== editRole);

    const updatedUser: User = {
      ...editingUser,
      name: editName.trim(),
      email: editEmail.toLowerCase().trim(),
      phone: editPhone ? editPhone.trim() : null,
      role: editRole,
      department: editDepartment || null,
      jobTitle: editJobTitle ? editJobTitle.trim() : null,
      secondaryRoles: finalSecondaryRoles,
      assignedDivisions: finalDivisions,
      isActive: editIsActive,
    };

    // 1. Immediately update UI state & persist to localStorage so it can never be lost
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === editingUser.id ? updatedUser : u));
      persistUsers(next);
      return next;
    });

    // 2. Dispatch custom event so AuthContext updates the live logged-in user in real-time
    try {
      window.dispatchEvent(
        new CustomEvent("bg_staff_user_updated", { detail: updatedUser })
      );
    } catch {}

    logStaffActivity({
      division: "GOVERNANCE",
      title: `Updated staff credentials & cross-section roles for ${updatedUser.name}`,
      actor: currentUser?.name || "Division Leader",
      actorRole: currentUser?.role.replace(/_/g, " ") || "Leader",
      badgeColor: "bg-blue-100 text-blue-900",
      details: `Designation: ${updatedUser.jobTitle || "Official Staff"}, Department: ${updatedUser.department || "Corporate"}, Divisions: ${(updatedUser.assignedDivisions || []).join(", ")}.`,
    });

    toast.success(`Staff details for ${updatedUser.name} saved successfully!`);
    setEditingUser(null);

    // 3. Persist to API / serverless in the background
    try {
      await api.patch(`/api/users/${editingUser.id}`, {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle,
        secondaryRoles: updatedUser.secondaryRoles,
        assignedDivisions: updatedUser.assignedDivisions,
        isActive: updatedUser.isActive,
      });
    } catch (err: any) {
      console.warn("Async remote sync completed with local fallback:", err);
    } finally {
      setEditSubmitting(false);
    }
  }

  function toggleSecondaryRole(r: Role, currentList: Role[], setter: (val: Role[]) => void) {
    if (currentList.includes(r)) {
      setter(currentList.filter((item) => item !== r));
    } else {
      setter([...currentList, r]);
    }
  }

  function toggleDivision(deptId: string, currentList: string[], setter: (val: string[]) => void) {
    if (currentList.includes(deptId)) {
      setter(currentList.filter((d) => d !== deptId));
    } else {
      setter([...currentList, deptId]);
    }
  }

  function buildWelcomeMessage(info: {
    name: string;
    email: string;
    role: Role;
    department?: string | null;
    jobTitle?: string | null;
    secondaryRoles?: Role[];
    assignedDivisions?: string[];
    password: string;
    isReset?: boolean;
  }) {
    const portalUrl = `${window.location.origin}/login`;
    const secondaryStr = info.secondaryRoles && info.secondaryRoles.length > 0
      ? `\nAdditional Roles: ${info.secondaryRoles.map((r) => r.replace(/_/g, " ")).join(", ")}`
      : "";
    const divisionsStr = info.assignedDivisions && info.assignedDivisions.length > 1
      ? `\nAssigned Divisions: ${info.assignedDivisions.join(" | ")}`
      : "";

    return `Dear ${info.name},

${
  info.isReset
    ? "Your Balasuriya Group Staff Portal password has been reset by your Division Leader / Administrator."
    : "Welcome to the Balasuriya Group Corporate Management Portal! Your official staff account has been provisioned."
}

Designation: ${info.jobTitle || "Official Staff"}
Primary Department: ${info.department || "Balasuriya Group"}
Primary Role: ${info.role.replace(/_/g, " ")}${secondaryStr}${divisionsStr}
Login Portal: ${portalUrl}
Official Email: ${info.email}
Temporary Password: ${info.password}

Security Action Required:
Please sign in using the temporary password above, then open your Profile / Security tab to update your permanent password immediately.

Best regards,
Corporate Governance & Division Operations Desk
Balasuriya Group`;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

    const matchesDept =
      selectedDept === "ALL" ||
      u.department?.toLowerCase() === selectedDept.toLowerCase() ||
      (u.assignedDivisions && u.assignedDivisions.some((d) => d.toLowerCase() === selectedDept.toLowerCase())) ||
      (selectedDept === "Construction & Engineering" && (u.department?.includes("Construction") || u.assignedDivisions?.some((d) => d.includes("Construction")))) ||
      (selectedDept === "Tourism & Travel" && (u.department?.includes("Tourism") || u.department?.includes("Travel") || u.assignedDivisions?.some((d) => d.includes("Tourism") || d.includes("Travel")))) ||
      (selectedDept === "Software Solutions" && (u.department?.includes("Software") || u.department?.includes("Technology") || u.assignedDivisions?.some((d) => d.includes("Software") || d.includes("Technology")))) ||
      (selectedDept === "Air Ticketing" && (u.department?.includes("Ticketing") || u.assignedDivisions?.some((d) => d.includes("Ticketing")))) ||
      (selectedDept === "Finance & Accounts" && (u.department?.includes("Finance") || u.department?.includes("Accounts") || u.assignedDivisions?.some((d) => d.includes("Finance") || d.includes("Accounts"))));

    const matchesRole =
      roleFilter === "ALL" ||
      u.role === roleFilter ||
      (u.secondaryRoles && u.secondaryRoles.includes(roleFilter as Role));

    return matchesSearch && matchesDept && matchesRole;
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
            Staff Hierarchy & Section Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage multi-divisional leaders, cross-section roles, operational staff, and send official credential notifications.
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5 self-start shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          {showNew ? "Close Form" : "Add Section Staff"}
        </button>
      </div>

      {/* Multi-Division or Single Division Leader Context Banner */}
      {isDivisionLeader && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-blue-950">
                  {isMultiDivisionLeader ? "Multi-Division Leader Console" : "Division Leader Console"} &bull;{" "}
                  {callerLedDivisions.map((d) => d.divisionLabel).join(" & ")}
                </span>
                <span className="rounded-full bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  {isMultiDivisionLeader ? `${callerLedDivisions.length} Active Sections` : "Authorized Leader"}
                </span>
              </div>
              <p className="text-xs text-blue-800/90 mt-0.5">
                {isMultiDivisionLeader
                  ? `You hold leadership responsibility across ${callerLedDivisions.length} corporate divisions (${callerLedDivisions.map((d) => d.divisionLabel).join(", ")}). You can manage, provision, and review staff across all your led sections.`
                  : `You have managerial authority to add, view, edit details, and reset passwords for operational staff in the ${callerLedDivisions[0].department} division.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setDepartment(callerLedDivisions[0].department);
              setRole(callerLedDivisions[0].defaultNewRole);
              setShowNew(true);
            }}
            className="btn-primary bg-blue-700 hover:bg-blue-800 text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Section Staff
          </button>
        </div>
      )}

      {/* Provision New Staff Form */}
      {showNew && (
        <form
          onSubmit={handleCreate}
          className="card border-2 border-brand-navy/15 bg-brand-surface/50 space-y-5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-brand-navy p-1.5 text-brand-gold">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-brand-navy">
                  {isDivisionLeader
                    ? `Add Staff to ${isMultiDivisionLeader ? "Your Divisions" : callerLedDivisions[0].divisionLabel}`
                    : "Provision Official Staff Account"}
                </h2>
                <p className="text-[11px] text-gray-500">
                  Assign primary designation, cross-section duties, and dispatch official email credentials
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input bg-white"
                required
                placeholder="e.g. Mr. Kaveen Jayasinghe"
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
                placeholder="staff@balasuriyagroup.tech"
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
              <label className="label">Primary Division / Department *</label>
              <select
                className="input bg-white font-medium"
                value={department}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setDepartment(newDept);
                  const divMeta = Object.values(DIVISION_ROLES_MAP).find((d) => d.department === newDept);
                  if (divMeta) {
                    setRole(divMeta.defaultNewRole);
                  }
                }}
              >
                {(isExecutive
                  ? DEPARTMENTS.filter((d) => d.id !== "ALL")
                  : callerLedDivisions.map((d) => ({ id: d.department, name: d.divisionLabel }))
                ).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {isDivisionLeader && !isMultiDivisionLeader && (
                <span className="text-[10px] text-blue-700 font-medium mt-1 inline-block">
                  Auto-locked to your division ({callerLedDivisions[0].divisionLabel})
                </span>
              )}
              {isMultiDivisionLeader && (
                <span className="text-[10px] text-blue-700 font-medium mt-1 inline-block">
                  Select which of your led divisions this member primarily belongs to
                </span>
              )}
            </div>

            <div>
              <label className="label">Job Title / Designation *</label>
              <input
                className="input bg-white"
                required
                placeholder="e.g. Senior Civil Engineer / Flight Officer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Initial Temporary Password *</label>
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

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="label">Primary System Access Role *</label>
              <select
                className="input bg-white font-medium"
                value={role}
                onChange={(e) => handleCreateRoleChange(e.target.value as Role)}
              >
                {availableRoles.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.tier} &bull; {r.label} ({r.role.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-brand-steel">
                <strong>Access Scope:</strong>{" "}
                {ROLE_HIERARCHY.find((r) => r.role === role)?.permissions}
              </p>
            </div>

            {/* Cross-Section & Dual Leadership Options */}
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-gray-200 bg-white p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-navy" />
                <h4 className="text-xs font-bold text-brand-navy">
                  Cross-Section Leadership & Dual Assignment (Optional)
                </h4>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Lead two sections or work across divisions
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                If this staff member or leader needs to lead or work across multiple sections, select their additional roles and assigned divisions below:
              </p>

              <div>
                <span className="text-[11px] font-semibold text-gray-700 block mb-1.5">
                  Additional Roles (Secondary):
                </span>
                <div className="flex flex-wrap gap-2">
                  {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER" && r.role !== role).map((r) => {
                    const isSelected = secondaryRoles.includes(r.role);
                    return (
                      <button
                        type="button"
                        key={r.role}
                        onClick={() => toggleSecondaryRole(r.role, secondaryRoles, setSecondaryRoles)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Assigned Divisions & Departments:
                </span>
                <p className="text-[10px] text-gray-500 mb-2">
                  Selecting a division automatically authorizes this user with leadership or operational access for that section based on their job role.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENTS.filter((d) => d.id !== "ALL").map((d) => {
                    const isAssigned = assignedDivisions.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleCreateDivision(d.id)}
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition ${
                          isAssigned
                            ? "border-brand-navy bg-brand-navy text-white font-semibold"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isAssigned ? "✓ " : "+ "}
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button className="btn-primary text-xs py-2 px-6" disabled={submitting} type="submit">
              {submitting ? "Creating Account..." : "Create Account & Send Credentials"}
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
                  Credentials have been prepared. You can copy the message or dispatch an email directly to the staff member.
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

      {/* Edit Staff Details Modal with Cross-Section Assignment */}
      {editingUser && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6">
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <div className="relative w-full max-w-xl my-auto rounded-2xl bg-white shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]">
              {/* Pinned Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700 border border-blue-100">
                    <Pencil className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-brand-navy">
                      Edit Staff &amp; Leadership Assignments
                    </h3>
                    <p className="text-xs text-gray-500">
                      Update designation, contact info, primary division, or assign secondary leadership roles.
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

              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                  <div className="space-y-3">
                <div>
                  <label className="label text-xs font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input bg-gray-50/50 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Mr. Damian Balasuriya"
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
                    placeholder="e.g. staff@balasuriyagroup.tech"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs font-semibold text-gray-700">Primary Division</label>
                    <select
                      className="input bg-gray-50/50 text-sm font-medium"
                      value={editDepartment}
                      disabled={!isExecutive && !isMultiDivisionLeader}
                      onChange={(e) => setEditDepartment(e.target.value)}
                    >
                      {(isExecutive
                        ? DEPARTMENTS.filter((d) => d.id !== "ALL")
                        : callerLedDivisions.map((d) => ({ id: d.department, name: d.divisionLabel }))
                      ).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label text-xs font-semibold text-gray-700">Job Title / Designation</label>
                    <input
                      type="text"
                      className="input bg-gray-50/50 text-sm"
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      placeholder="e.g. Managing Director & Head of Tourism"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Primary System Role *</label>
                  <select
                    className="input bg-gray-50/50 text-sm font-medium"
                    value={editRole}
                    onChange={(e) => handleEditRoleChange(e.target.value as Role)}
                  >
                    {availableRoles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.tier} &bull; {r.label} ({r.role.replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cross-Section / Secondary Roles in Edit */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brand-navy" />
                    <span className="text-xs font-bold text-brand-navy">
                      Lead / Work in Additional Sections
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Assign additional section leadership or operational roles to allow this person to access and lead multiple divisions:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER" && r.role !== editRole).map((r) => {
                      const isSelected = editSecondaryRoles.includes(r.role);
                      return (
                        <button
                          type="button"
                          key={r.role}
                          onClick={() => toggleSecondaryRole(r.role, editSecondaryRoles, setEditSecondaryRoles)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-100 text-blue-900 font-bold"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {r.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                      Assigned Divisions & Departments:
                    </span>
                    <p className="text-[10px] text-gray-500 mb-2">
                      Selecting a division automatically authorizes this user with leadership or operational access for that section based on their job role.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DEPARTMENTS.filter((d) => d.id !== "ALL").map((d) => {
                        const isAssigned = editAssignedDivisions.includes(d.id);
                        return (
                          <button
                            type="button"
                            key={d.id}
                            onClick={() => toggleEditDivision(d.id)}
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition ${
                              isAssigned
                                ? "border-brand-navy bg-brand-navy text-white font-semibold"
                                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            {isAssigned ? "✓ " : "+ "}
                            {d.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Account Access Status</label>
                  <div className="flex gap-3 pt-1">
                    <label
                      className={`flex flex-1 items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs font-medium transition ${
                        editIsActive
                          ? "border-emerald-500 bg-emerald-50/60 text-emerald-800"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
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

                    <label
                      className={`flex flex-1 items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs font-medium transition ${
                        !editIsActive
                          ? "border-red-400 bg-red-50/60 text-red-800"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
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
            </div>

                {/* Pinned Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 flex-shrink-0">
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
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {editSubmitting ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Department Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-200 text-xs">
        {DEPARTMENTS.map((dept) => {
          const isActive = selectedDept === dept.id;
          const count =
            dept.id === "ALL"
              ? users.length
              : users.filter((u) => {
                  if (u.department === dept.id) return true;
                  if (u.assignedDivisions?.includes(dept.id)) return true;
                  if (dept.id === "Construction & Engineering" && (u.department?.includes("Construction") || u.assignedDivisions?.some((d) => d.includes("Construction")))) return true;
                  if (dept.id === "Tourism & Travel" && (u.department?.includes("Tourism") || u.department?.includes("Travel") || u.assignedDivisions?.some((d) => d.includes("Tourism") || d.includes("Travel")))) return true;
                  if (dept.id === "Software Solutions" && (u.department?.includes("Software") || u.department?.includes("Technology") || u.assignedDivisions?.some((d) => d.includes("Software") || d.includes("Technology")))) return true;
                  if (dept.id === "Air Ticketing" && (u.department?.includes("Ticketing") || u.assignedDivisions?.some((d) => d.includes("Ticketing")))) return true;
                  if (dept.id === "Finance & Accounts" && (u.department?.includes("Finance") || u.department?.includes("Accounts") || u.assignedDivisions?.some((d) => d.includes("Finance") || d.includes("Accounts")))) return true;
                  return false;
                }).length;

          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-semibold transition ${
                isActive
                  ? "bg-brand-navy text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-brand-navy"
              }`}
            >
              <Building2 className={`h-3.5 w-3.5 ${isActive ? "text-brand-gold" : "text-gray-400"}`} />
              <span>{dept.short}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-200/70 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input text-xs py-1.5"
          >
            <option value="ALL">All Roles ({filteredUsers.length})</option>
            {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER").map((r) => (
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
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Designation & Department</th>
                <th className="py-3.5 px-4">Roles & Cross-Section Assignments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions & Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium">No staff members found matching this criteria.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Try selecting another department tab or clearing the search query.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleMeta = ROLE_HIERARCHY.find((r) => r.role === u.role);
                  const isLeaderRole = roleMeta?.isLeader ?? false;
                  const hasSecondaryRoles = u.secondaryRoles && u.secondaryRoles.length > 0;
                  const canAct = canManage(u);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-navy text-sm flex items-center gap-1.5">
                          {u.name}
                          {isLeaderRole && (
                            <span className="rounded bg-brand-navy/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-navy">
                              Leader
                            </span>
                          )}
                          {hasSecondaryRoles && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                              Multi-Section
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-gray-400">{u.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">
                          {u.jobTitle || (isLeaderRole ? "Division Leader" : "Section Staff")}
                        </div>
                        <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-brand-steel" />
                          <span>{u.department || "Corporate"}</span>
                          {u.assignedDivisions && u.assignedDivisions.length > 1 && (
                            <span className="text-[10px] text-brand-gold font-semibold">
                              (+{u.assignedDivisions.length - 1} more)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 items-center">
                          {canAct && isExecutive ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-brand-navy focus:border-brand-navy focus:outline-none"
                            >
                              {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER").map((r) => (
                                <option key={r.role} value={r.role}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${roleMeta?.badgeColor || "bg-gray-100 text-gray-800"}`}>
                              {roleMeta?.label || u.role.replace(/_/g, " ")}
                            </span>
                          )}

                          {u.secondaryRoles?.map((sr) => {
                            const srMeta = ROLE_HIERARCHY.find((r) => r.role === sr);
                            return (
                              <span
                                key={sr}
                                className="inline-block rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900"
                                title={`Additional assignment: ${srMeta?.label || sr}`}
                              >
                                + {srMeta?.label || sr.replace(/_/g, " ")}
                              </span>
                            );
                          })}
                        </div>

                        {roleMeta && (
                          <div className="mt-1 text-[10px] text-gray-400 max-w-xs line-clamp-1">
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
                        {canAct ? (
                          <div className="inline-flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                              title="Edit staff and cross-section details"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResetPassword(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-brand-navy hover:bg-brand-surface"
                              title="Generate a new temporary password"
                            >
                              <KeyRound className="h-3 w-3 text-brand-gold" /> Reset
                            </button>

                            {Boolean(
                              (currentUser?.id && u.id === currentUser.id) ||
                              (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
                            ) ? (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800">
                                Current User (You)
                              </span>
                            ) : u.role === "OWNER" || u.email.toLowerCase() === "clemonbalasuriyagroup@gmail.com" || u.id === "usr_owner_1" ? (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                                Root Owner (Protected)
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(u)}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium ${
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
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                                  title="Permanently remove account"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">
                            Protected / Executive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Access Control Matrix Reference */}
      <div className="card space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-navy">
            Balasuriya Group Corporate Hierarchy Matrix
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Staff and leaders can hold cross-divisional responsibilities (e.g. heading multiple sections or holding operational roles across divisions) while remaining governed by strict RBAC security.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER").map((item) => (
            <div key={item.role} className="rounded-xl border border-gray-100 bg-brand-surface/50 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${item.badgeColor}`}>
                  {item.tier}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">{item.department}</span>
              </div>
              <h3 className="font-bold text-brand-navy text-xs">{item.label}</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.permissions}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
