export type Role =
  | "OWNER"
  | "ADMIN"
  | "CONSTRUCTION_MANAGER"
  | "CONSTRUCTION_STAFF"
  | "TOURISM_AGENT"
  | "TOURISM_STAFF"
  | "FINANCE_APPROVER"
  | "FINANCE_STAFF"
  | "TICKET_AGENT"
  | "TICKET_STAFF"
  | "SOFTWARE_ENGINEER"
  | "SOFTWARE_STAFF"
  | "CHARTERED_ACCOUNTANT"
  | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  department?: string | null;
  jobTitle?: string | null;
  secondaryRoles?: Role[];
  assignedDivisions?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: number;
}

export const DEPARTMENT_ROLES_MAP: Record<string, { leader: Role; staff: Role }> = {
  "Construction & Engineering": { leader: "CONSTRUCTION_MANAGER", staff: "CONSTRUCTION_STAFF" },
  "Civil Engineering & Construction": { leader: "CONSTRUCTION_MANAGER", staff: "CONSTRUCTION_STAFF" },
  "Tourism & Travel": { leader: "TOURISM_AGENT", staff: "TOURISM_STAFF" },
  "StayLanka & Foreign Tours": { leader: "TOURISM_AGENT", staff: "TOURISM_STAFF" },
  "Software Solutions": { leader: "SOFTWARE_ENGINEER", staff: "SOFTWARE_STAFF" },
  "Software & Technology Solutions": { leader: "SOFTWARE_ENGINEER", staff: "SOFTWARE_STAFF" },
  "Air Ticketing": { leader: "TICKET_AGENT", staff: "TICKET_STAFF" },
  "Balasuriya Air Ticketing & Visa": { leader: "TICKET_AGENT", staff: "TICKET_STAFF" },
  "Finance & Accounts": { leader: "FINANCE_APPROVER", staff: "FINANCE_STAFF" },
  "Corporate Finance & Accounts": { leader: "FINANCE_APPROVER", staff: "FINANCE_STAFF" },
  "Executive Board": { leader: "ADMIN", staff: "ADMIN" },
};

export function isLeaderRole(role: Role): boolean {
  return [
    "OWNER",
    "ADMIN",
    "CONSTRUCTION_MANAGER",
    "TOURISM_AGENT",
    "SOFTWARE_ENGINEER",
    "TICKET_AGENT",
    "FINANCE_APPROVER",
    "CHARTERED_ACCOUNTANT",
  ].includes(role);
}

export function getEffectiveUserRoles(user: User | null | undefined): Role[] {
  if (!user) return [];
  const rolesSet = new Set<Role>();
  if (user.role) rolesSet.add(user.role);
  if (user.secondaryRoles && Array.isArray(user.secondaryRoles)) {
    user.secondaryRoles.forEach((r) => rolesSet.add(r));
  }

  const leader = isLeaderRole(user.role) || (user.secondaryRoles && user.secondaryRoles.some(isLeaderRole));

  if (user.assignedDivisions && Array.isArray(user.assignedDivisions)) {
    user.assignedDivisions.forEach((dept) => {
      const match = DEPARTMENT_ROLES_MAP[dept];
      if (match) {
        rolesSet.add(leader ? match.leader : match.staff);
      }
    });
  }

  return Array.from(rolesSet);
}

export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED";

export interface ProgressUpdate {
  id: string;
  projectId: string;
  currentStatus: string;
  nextPeriodPlan: string;
  percentComplete: number;
  photoUrls: string[];
  createdAt: string;
}

export interface ConstructionProject {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: ProjectStatus;
  projectType: string | null;
  coverImageUrl: string | null;
  featured: boolean;
  startDate: string | null;
  targetEndDate: string | null;
  progressUpdates: ProgressUpdate[];
}

export type TourCategory = "LOCAL" | "FOREIGN" | "FAMILY" | "TEAM" | "RELIGIOUS";

export interface Promotion {
  id: string;
  packageId: string | null;
  title: string;
  description: string | null;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  category: TourCategory;
  priceLkr: string;
  durationDays: number;
  availableSlots: number;
  isActive: boolean;
  promotions: Promotion[];
}

export type BookingType =
  | "TOUR_PACKAGE"
  | "AIR_TICKET"
  | "VISA_ASSISTANCE"
  | "CONSTRUCTION_QUOTE"
  | "SOFTWARE_PROJECT"
  | "GENERAL_INQUIRY";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  type: BookingType;
  status: BookingStatus;
  package?: TourPackage | null;
  payments: Payment[];
  details?: Record<string, any> | null;
  createdAt: string;
}

export type PaymentMethod = "CARD" | "GOOGLE_PAY" | "BANK_DEPOSIT" | "KOKO";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Payment {
  id: string;
  bookingId: string;
  amountLkr: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  createdAt: string;
  booking?: Booking;
}

export type VisaCategory = "TOURIST" | "BUSINESS" | "TRANSIT" | "STUDENT" | "CONFERENCE";
export type VisaStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCS_REQUIRED"
  | "EMBASSY_PROCESSING"
  | "APPROVED"
  | "REJECTED";

export interface VisaApplication {
  id: string;
  referenceNo: string;
  userEmail: string;
  userName: string;
  phone: string;
  country: string;
  countryFlag: string;
  category: VisaCategory;
  visaTypeLabel: string;
  entryType: "SINGLE" | "MULTIPLE";
  passportNumber: string;
  passportExpiry: string;
  passportIssueDate?: string;
  nationality: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  occupation?: string;
  employerName?: string;
  intendedArrivalDate: string;
  intendedDepartureDate?: string;
  stayDurationDays?: number;
  destinationAddress?: string;
  sponsorCompany?: string;
  sponsorContact?: string;
  meetingPurpose?: string;
  notes?: string;
  documentSummary?: string;
  status: VisaStatus;
  statusNotes?: string;
  submittedAt: string;
  updatedAt: string;
  canEdit?: boolean;
}
