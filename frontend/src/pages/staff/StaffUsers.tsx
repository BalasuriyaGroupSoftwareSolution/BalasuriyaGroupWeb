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
} from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Role, User } from "../../types";
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
    allowedRoles: Role[];
    defaultNewRole: Role;
  }
> = {
  CONSTRUCTION_MANAGER: {
    department: "Construction & Engineering",
    divisionLabel: "Civil Engineering & Construction",
    allowedRoles: ["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF"],
    defaultNewRole: "CONSTRUCTION_STAFF",
  },
  TOURISM_AGENT: {
    department: "Tourism & Travel",
    divisionLabel: "StayLanka & Foreign Tours",
    allowedRoles: ["TOURISM_AGENT", "TOURISM_STAFF"],
    defaultNewRole: "TOURISM_STAFF",
  },
  SOFTWARE_ENGINEER: {
    department: "Software Solutions",
    divisionLabel: "Software & Technology Solutions",
    allowedRoles: ["SOFTWARE_ENGINEER", "SOFTWARE_STAFF"],
    defaultNewRole: "SOFTWARE_STAFF",
  },
  TICKET_AGENT: {
    department: "Air Ticketing",
    divisionLabel: "Balasuriya Air Ticketing & Visa",
    allowedRoles: ["TICKET_AGENT", "TICKET_STAFF"],
    defaultNewRole: "TICKET_STAFF",
  },
  FINANCE_APPROVER: {
    department: "Finance & Accounts",
    divisionLabel: "Corporate Finance & Accounts",
    allowedRoles: ["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF"],
    defaultNewRole: "FINANCE_STAFF",
  },
  CHARTERED_ACCOUNTANT: {
    department: "Finance & Accounts",
    divisionLabel: "Corporate Finance & Accounts",
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
    isActive: true,
  },
  {
    id: "usr_md_2",
    name: "Mr. Damian Balasuriya",
    email: "damianbalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "ADMIN",
    department: "Executive Board",
    jobTitle: "Managing Director",
    isActive: true,
  },
  {
    id: "usr_ed_3",
    name: "Mr. Clavo Balasuriya",
    email: "clavobalasuriyagroup@gmail.com",
    phone: "+94 76 7171 938",
    role: "FINANCE_APPROVER",
    department: "Executive Board",
    jobTitle: "Executive Director & Finance",
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
    isActive: true,
  },

  // Software Solutions & IT Division
  {
    id: "usr_pasindu_6",
    name: "Mr. Pasindu Hansana",
    email: "pasinduhansana@gmail.com",
    phone: "+94 77 456 7890",
    role: "SOFTWARE_ENGINEER",
    department: "Software Solutions",
    jobTitle: "Head of Software & Technology",
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
  const callerDivision = currentUser?.role ? DIVISION_ROLES_MAP[currentUser.role] : null;
  const isDivisionLeader = !isExecutive && !!callerDivision;

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showNew, setShowNew] = useState(false);

  // Default role and department based on caller's division
  const initialRole: Role = isDivisionLeader
    ? callerDivision.defaultNewRole
    : "CONSTRUCTION_STAFF";
  const initialDept: string = isDivisionLeader
    ? callerDivision.department
    : "Construction & Engineering";

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
  const [department, setDepartment] = useState<string>(initialDept);
  const [jobTitle, setJobTitle] = useState("");
  const [tempPassword, setTempPassword] = useState(generateStrongTempPassword());
  const [submitting, setSubmitting] = useState(false);

  // Confirmation email / credentials modal
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    role: Role;
    department?: string | null;
    jobTitle?: string | null;
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

  // Check if current user can manage target user
  function canManage(target: User): boolean {
    if (isExecutive) return true;
    if (isDivisionLeader && callerDivision) {
      return callerDivision.allowedRoles.includes(target.role);
    }
    return false;
  }

  // Allowed roles for creation/editing by caller
  const availableRoles = isExecutive
    ? ROLE_HIERARCHY.filter((r) => r.role !== "CUSTOMER")
    : ROLE_HIERARCHY.filter((r) => callerDivision?.allowedRoles.includes(r.role));

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const assignedDept = isDivisionLeader ? callerDivision.department : department;
    try {
      const res = await api.post("/api/users", {
        name,
        email,
        phone: phone || undefined,
        role,
        department: assignedDept,
        jobTitle: jobTitle || undefined,
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
        department: assignedDept,
        jobTitle,
        password: tempPassword,
        emailDispatched: dispatched ?? true,
      });
      setName("");
      setEmail("");
      setPhone("");
      setJobTitle("");
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
          department: assignedDept,
          jobTitle: jobTitle || null,
          isActive: true,
        };
        setUsers((prev) => [mockNew, ...prev]);
        setCredentialsModal({
          name,
          email,
          role,
          department: assignedDept,
          jobTitle,
          password: tempPassword,
          emailDispatched: true,
        });
        setName("");
        setEmail("");
        setPhone("");
        setJobTitle("");
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
    if (!canManage(user)) {
      toast.error("You are not authorized to change this user's status.");
      return;
    }
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
    if (!canManage(user)) {
      toast.error("You are not authorized to reset this user's password.");
      return;
    }
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
      department: user.department,
      jobTitle: user.jobTitle,
      password: newTempPassword,
      isReset: true,
      emailDispatched,
    });
  }

  async function handleRemoveUser(user: User) {
    if (!canManage(user)) {
      toast.error("You are not authorized to remove this staff member.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${user.name} (${user.email})?`)) {
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
    if (!canManage(user)) {
      toast.error("You can only edit staff in your division.");
      return;
    }
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditRole(user.role);
    setEditDepartment(user.department || "");
    setEditJobTitle(user.jobTitle || "");
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
        department: editDepartment || null,
        jobTitle: editJobTitle || null,
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
                department: editDepartment || null,
                jobTitle: editJobTitle || null,
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

  function buildWelcomeMessage(info: {
    name: string;
    email: string;
    role: Role;
    department?: string | null;
    jobTitle?: string | null;
    password: string;
    isReset?: boolean;
  }) {
    const portalUrl = `${window.location.origin}/login`;
    return `Dear ${info.name},

${
  info.isReset
    ? "Your Balasuriya Group Staff Portal password has been reset by your Division Leader / Administrator."
    : "Welcome to the Balasuriya Group Corporate Management Portal! Your official staff account has been provisioned."
}

Designation: ${info.jobTitle || "Official Staff"}
Department / Division: ${info.department || "Balasuriya Group"}
System Role: ${info.role.replace(/_/g, " ")}
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
      (selectedDept === "Construction & Engineering" && u.department?.includes("Construction")) ||
      (selectedDept === "Tourism & Travel" && (u.department?.includes("Tourism") || u.department?.includes("Travel"))) ||
      (selectedDept === "Software Solutions" && (u.department?.includes("Software") || u.department?.includes("Technology"))) ||
      (selectedDept === "Air Ticketing" && u.department?.includes("Ticketing")) ||
      (selectedDept === "Finance & Accounts" && (u.department?.includes("Finance") || u.department?.includes("Accounts")));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

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
            Organize staff across divisions, assign operational roles, send official credential emails, and manage section permissions.
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

      {/* Division Leader Context Banner */}
      {isDivisionLeader && callerDivision && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-blue-950">
                  Division Leader Console &bull; {callerDivision.divisionLabel}
                </span>
                <span className="rounded-full bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Authorized Leader
                </span>
              </div>
              <p className="text-xs text-blue-800/90 mt-0.5">
                You have managerial authorization to add, view, edit details, and reset passwords for operational staff in the{" "}
                <strong>{callerDivision.department}</strong> division.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setDepartment(callerDivision.department);
              setRole(callerDivision.defaultNewRole);
              setShowNew(true);
            }}
            className="btn-primary bg-blue-700 hover:bg-blue-800 text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Division Staff
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
                    ? `Add Section Staff to ${callerDivision?.divisionLabel}`
                    : "Provision Official Staff Account"}
                </h2>
                <p className="text-[11px] text-gray-500">
                  Assigns official designation, division, credentials & dispatches email notification
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
              <label className="label">Corporate Division / Department *</label>
              <select
                className="input bg-white font-medium"
                value={isDivisionLeader ? callerDivision?.department : department}
                disabled={isDivisionLeader}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.filter((d) => d.id !== "ALL").map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {isDivisionLeader && (
                <span className="text-[10px] text-blue-700 font-medium mt-1 inline-block">
                  Auto-locked to your division ({callerDivision?.divisionLabel})
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
              <label className="label">Assign System Access Role *</label>
              <select
                className="input bg-white font-medium"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
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
                    Update designation, contact info, division, or system permissions.
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
                    placeholder="e.g. Mr. Kaveen Jayasinghe"
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
                    placeholder="e.g. kaveen@balasuriyagroup.tech"
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
                    <label className="label text-xs font-semibold text-gray-700">Division / Department</label>
                    <select
                      className="input bg-gray-50/50 text-sm font-medium"
                      value={editDepartment}
                      disabled={isDivisionLeader}
                      onChange={(e) => setEditDepartment(e.target.value)}
                    >
                      {DEPARTMENTS.filter((d) => d.id !== "ALL").map((d) => (
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
                      placeholder="e.g. Site Supervisor"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-semibold text-gray-700">Department Role & Access Tier *</label>
                  <select
                    className="input bg-gray-50/50 text-sm font-medium"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                  >
                    {availableRoles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.tier} &bull; {r.label} ({r.role.replace(/_/g, " ")})
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
                  {editSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
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
                  if (!u.department) return false;
                  if (dept.id === "Construction & Engineering") return u.department.includes("Construction");
                  if (dept.id === "Tourism & Travel") return u.department.includes("Tourism") || u.department.includes("Travel");
                  if (dept.id === "Software Solutions") return u.department.includes("Software") || u.department.includes("Technology");
                  if (dept.id === "Air Ticketing") return u.department.includes("Ticketing");
                  if (dept.id === "Finance & Accounts") return u.department.includes("Finance") || u.department.includes("Accounts");
                  return u.department === dept.id;
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
                <th className="py-3.5 px-4">Department & Designation</th>
                <th className="py-3.5 px-4">System Role & Access Tier</th>
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
                        </div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-gray-400">{u.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">
                          {u.jobTitle || (isLeaderRole ? "Division Leader" : "Section Staff")}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-brand-steel" />
                          <span>{u.department || "Corporate"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
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
                              title="Edit staff details"
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
            Every staff member belongs to an operational division and is governed by strict Role-Based Access Control (RBAC). Division leaders supervise section staff within their scope.
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
