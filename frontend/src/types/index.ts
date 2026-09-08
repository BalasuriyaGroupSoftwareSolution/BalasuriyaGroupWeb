export type Role =
  | "OWNER"
  | "ADMIN"
  | "CONSTRUCTION_MANAGER"
  | "TOURISM_AGENT"
  | "FINANCE_APPROVER"
  | "TICKET_AGENT"
  | "SOFTWARE_ENGINEER"
  | "CHARTERED_ACCOUNTANT"
  | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  isActive?: boolean;
  createdAt?: string;
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

export type BookingType = "TOUR_PACKAGE" | "AIR_TICKET" | "VISA_ASSISTANCE" | "CONSTRUCTION_QUOTE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  type: BookingType;
  status: BookingStatus;
  package?: TourPackage | null;
  payments: Payment[];
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
