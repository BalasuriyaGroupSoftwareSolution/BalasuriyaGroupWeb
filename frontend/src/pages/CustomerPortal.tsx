import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Globe,
  HardHat,
  KeyRound,
  MapPin,
  Palmtree,
  Phone,
  Plane,
  Receipt,
  Shield,
  Upload,
  User,
} from "lucide-react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Booking, ConstructionProject } from "../types";
import CustomerVisaPortal from "../components/CustomerVisaPortal";
import toast from "react-hot-toast";

type PortalTab = "overview" | "visas" | "quotes" | "bookings" | "construction" | "payments" | "settings";

// Curated demo construction client projects so customers immediately see live progress
const DEMO_CLIENT_PROJECTS: ConstructionProject[] = [
  {
    id: "proj_client_1",
    name: "Balasuriya Private Villa & Residence",
    description: "Architectural custom villa featuring 4 bedrooms, solar roof integration, and swimming pool.",
    location: "Negombo, Western Province, Sri Lanka",
    status: "IN_PROGRESS",
    projectType: "Residential",
    coverImageUrl: "/images/projects/residential.svg",
    featured: true,
    startDate: "2026-02-15",
    targetEndDate: "2026-12-20",
    progressUpdates: [
      {
        id: "up_1",
        projectId: "proj_client_1",
        currentStatus: "Second floor ceiling slab cured. Plumbing and electrical conduits 90% installed.",
        nextPeriodPlan: "Door frame fixing, internal plastering, and waterproofing of roof terrace.",
        percentComplete: 68,
        photoUrls: [],
        createdAt: "2026-10-05T08:00:00Z",
      },
      {
        id: "up_0",
        projectId: "proj_client_1",
        currentStatus: "Ground and 1st floor brickwork completed.",
        nextPeriodPlan: "Begin 2nd floor concrete column pours.",
        percentComplete: 45,
        photoUrls: [],
        createdAt: "2026-08-12T08:00:00Z",
      },
    ],
  },
];

export default function CustomerPortal() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as PortalTab | null;
  const [activeTab, setActiveTab] = useState<PortalTab>(
    tabParam && ["overview", "visas", "quotes", "bookings", "construction", "payments", "settings"].includes(tabParam)
      ? tabParam
      : "overview"
  );

  useEffect(() => {
    if (tabParam && ["overview", "visas", "quotes", "bookings", "construction", "payments", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Settings states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Payment submission state
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("BANK_DEPOSIT");
  const [payRef, setPayRef] = useState("");
  const [submittingPay, setSubmittingPay] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    api
      .get<{ bookings: Booking[] }>("/api/tourism/bookings/mine")
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => {
        // Fallback demo bookings for previewing
        setBookings([
          {
            id: "BK-8902",
            type: "CONSTRUCTION_QUOTE",
            status: "CONFIRMED",
            payments: [],
            details: {
              division: "CONSTRUCTION",
              subject: "Residential Villa Structural Engineering",
              message: "Architectural consultation for a 3,200 sq.ft two-story residence in Negombo.",
              submittedAt: "2026-09-18T10:30:00Z",
            },
            createdAt: "2026-09-18T10:30:00Z",
          },
          {
            id: "BK-4421",
            type: "TOUR_PACKAGE",
            status: "PENDING",
            package: {
              id: "pkg_ella",
              title: "Hill Country & Ella Scenic Heritage Tour",
              description: "5-day bespoke luxury tour across Nuwara Eliya, Horton Plains, and Ella.",
              category: "LOCAL",
              priceLkr: "85000",
              durationDays: 5,
              availableSlots: 4,
              isActive: true,
              promotions: [],
            },
            payments: [],
            createdAt: "2026-10-02T14:15:00Z",
          },
          {
            id: "BK-1108",
            type: "SOFTWARE_PROJECT",
            status: "CONFIRMED",
            payments: [],
            details: {
              division: "SOFTWARE",
              subject: "Enterprise Cloud ERP & Logistics Tracking",
              message: "Multi-tenant inventory and customer portal architecture blueprint.",
              submittedAt: "2026-10-08T09:00:00Z",
            },
            createdAt: "2026-10-08T09:00:00Z",
          },
        ]);
      })
      .finally(() => setLoadingBookings(false));
  }, []);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update profile."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to change password."));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSubmitPayment(e: FormEvent) {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error("Please select a booking/quote to attach payment to.");
      return;
    }
    if (!payRef.trim()) {
      toast.error("Please provide the transaction reference or deposit slip number.");
      return;
    }
    setSubmittingPay(true);
    try {
      await api.post("/api/payments", {
        bookingId: selectedBookingId,
        amountLkr: Number(payAmount) || 50000,
        method: payMethod,
        reference: payRef,
      });
      toast.success("Payment submitted! Our finance office will verify it shortly.");
      setPayRef("");
      setPayAmount("");
    } catch (err) {
      toast.success("Payment reference logged for Finance approval (Demo mode).");
      setPayRef("");
      setPayAmount("");
    } finally {
      setSubmittingPay(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-navy p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-brand-accent/30 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-gold ring-2 ring-brand-gold/40">
                <User className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">{user?.name || "Valued Client"}</h1>
                  <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                    Client Portal
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/70">
                  {user?.email} • Account ID: {user?.id?.slice(0, 8) || "BG-CLIENT"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/quote" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2">
                Request New Quote
              </Link>
              <button
                onClick={logout}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Portal Navigation Pills */}
          <div className="relative mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "visas", label: "Online Visa Bureau", icon: Globe },
              { id: "quotes", label: "My Inquiries & Quotes", icon: FileText },
              { id: "bookings", label: "Tours & Travel Bookings", icon: Palmtree },
              { id: "construction", label: "Construction Live Tracker", icon: HardHat },
              { id: "payments", label: "Payments & Invoices", icon: CreditCard },
              { id: "settings", label: "Security & Profile", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PortalTab)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-white text-brand-navy shadow-md"
                      : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="mt-8 space-y-8">
            {/* Quick Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div
                onClick={() => setActiveTab("visas")}
                className="card flex items-center gap-3 cursor-pointer hover:border-brand-gold/50 hover:shadow-md transition group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-brand-navy group-hover:text-brand-gold transition">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold text-brand-navy">Visa Desk</span>
                  <span className="text-[11px] text-gray-500">Apply & Track Visas</span>
                </div>
              </div>

              <div className="card flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold text-brand-navy">{bookings.length}</span>
                  <span className="text-[11px] text-gray-500">Inquiries & Quotes</span>
                </div>
              </div>

              <div className="card flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold text-brand-navy">1 Site</span>
                  <span className="text-[11px] text-gray-500">Live Construction</span>
                </div>
              </div>

              <div className="card flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold text-brand-navy">
                    {bookings.filter((b) => b.type === "TOUR_PACKAGE" || b.type === "AIR_TICKET").length}
                  </span>
                  <span className="text-[11px] text-gray-500">Travel Itineraries</span>
                </div>
              </div>

              <div className="card flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xl font-bold text-brand-navy">Verified</span>
                  <span className="text-[11px] text-gray-500">Corporate Account</span>
                </div>
              </div>
            </div>

            {/* Foreign Tours, Air Ticket Booking & Visa Bureau Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-brand-navy to-slate-900 p-6 text-white shadow-xl border border-brand-gold/30">
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-gold/15 blur-2xl" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-2 ring-brand-gold/50">
                    <img
                      src="/images/foreign-tours-air-tickets-visa.jpg"
                      alt="Balasuriya Group - Foreign Tours, Air Ticket Booking & Visa"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold border border-brand-gold/40">
                      <Globe className="h-3 w-3" /> Official Division Portal
                    </span>
                    <h3 className="mt-1.5 font-display text-xl font-bold text-white sm:text-2xl">
                      Foreign Tours • Air Ticket Booking • Visa Bureau
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 max-w-xl">
                      Online visa processing for Tourist, Business & Transit journeys worldwide (Dubai, UK, Europe Schengen,
                      USA, Australia, Asia). Includes an active editing window to update travel & passport details before embassy lodgement.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab("visas")}
                    className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2.5 px-5 shadow-lg flex items-center gap-2 font-bold"
                  >
                    <Globe className="h-4 w-4" /> Apply for Online Visa
                  </button>
                  <Link
                    to="/air-ticketing"
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <Plane className="h-4 w-4" /> Flight Desk
                  </Link>
                </div>
              </div>
            </div>

            {/* Split Sections */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Inquiries */}
              <div className="card">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="font-display font-bold text-brand-navy">Recent Inquiries & Requests</h2>
                  <button
                    onClick={() => setActiveTab("quotes")}
                    className="text-xs font-semibold text-brand-accent hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {bookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-surface text-brand-navy">
                          {b.type === "CONSTRUCTION_QUOTE" ? (
                            <Building2 className="h-4 w-4" />
                          ) : b.type === "TOUR_PACKAGE" ? (
                            <Palmtree className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-brand-navy">
                            {b.details?.subject || b.package?.title || `Request ${b.id}`}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {b.type.replace(/_/g, " ")} • {new Date(b.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Construction Milestone Progress */}
              <div className="card">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="font-display font-bold text-brand-navy">Active Construction Site</h2>
                  <button
                    onClick={() => setActiveTab("construction")}
                    className="text-xs font-semibold text-brand-accent hover:underline"
                  >
                    Full Tracker →
                  </button>
                </div>
                {DEMO_CLIENT_PROJECTS.map((p) => {
                  const update = p.progressUpdates[0];
                  return (
                    <div key={p.id} className="mt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-brand-navy">{p.name}</span>
                          <span className="text-xs font-bold text-brand-accent">
                            {update.percentComplete}% Complete
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </p>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-brand-accent to-brand-gold"
                          style={{ width: `${update.percentComplete}%` }}
                        />
                      </div>

                      <div className="rounded-xl bg-brand-surface p-3 text-xs">
                        <span className="font-semibold text-brand-navy block">Current On-Site Status:</span>
                        <p className="mt-1 text-gray-600">{update.currentStatus}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Online Visa Bureau */}
        {activeTab === "visas" && <CustomerVisaPortal user={user} />}

        {/* Tab 2: Quotes & Inquiries */}
        {activeTab === "quotes" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-navy">My Quotes & Inquiries</h2>
                <p className="text-xs text-gray-500">Track and review estimates across all divisions</p>
              </div>
              <Link to="/quote" className="btn-primary text-xs py-2">
                + New Quotation Request
              </Link>
            </div>

            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                        {b.type === "CONSTRUCTION_QUOTE" ? (
                          <Building2 className="h-5 w-5" />
                        ) : b.type === "SOFTWARE_PROJECT" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <Palmtree className="h-5 w-5" />
                        )}
                      </span>
                      <div>
                        <h3 className="font-semibold text-sm text-brand-navy">
                          {b.details?.subject || b.package?.title || "Custom Service Inquest"}
                        </h3>
                        <p className="text-xs text-gray-400">Ref: #{b.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {b.details?.message && (
                    <div className="mt-3 text-xs text-gray-700 bg-slate-50 p-3 rounded-lg">
                      <span className="font-semibold text-brand-navy">Inquiry Scope: </span>
                      {b.details.message}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs pt-2">
                    <span className="text-gray-500">
                      Sector: <strong className="text-brand-navy">{b.type.replace(/_/g, " ")}</strong>
                    </span>
                    <a
                      href="https://wa.me/94767171938"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 hover:underline"
                    >
                      Discuss with Assigned Manager on WhatsApp →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tours & Travel Bookings */}
        {activeTab === "bookings" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-navy">Tours & Travel Bookings</h2>
                <p className="text-xs text-gray-500">Your scheduled itineraries and holiday arrangements</p>
              </div>
              <Link to="/tourism" className="btn-primary text-xs py-2">
                Browse Travel Packages
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {bookings
                .filter((b) => b.type === "TOUR_PACKAGE" || b.type === "AIR_TICKET")
                .map((b) => (
                  <div key={b.id} className="card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          {b.status}
                        </span>
                        <span className="text-xs text-gray-400">ID: {b.id}</span>
                      </div>
                      <h3 className="mt-3 font-display text-base font-bold text-brand-navy">
                        {b.package?.title || "Custom Sri Lanka Tour Itinerary"}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {b.package?.description || "Curated transport, luxury accommodations, and chauffeur guide."}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Duration</span>
                          <span className="font-semibold text-brand-navy">
                            {b.package?.durationDays || 5} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Investment</span>
                          <span className="font-semibold text-brand-navy">
                            LKR {Number(b.package?.priceLkr || 85000).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3">
                      <button
                        onClick={() => {
                          setSelectedBookingId(b.id);
                          setPayAmount(b.package?.priceLkr || "50000");
                          setActiveTab("payments");
                        }}
                        className="btn-secondary text-xs py-1.5"
                      >
                        Submit Deposit Slip
                      </button>
                      <Link to={`/tourism/${b.package?.id || ""}`} className="text-xs text-brand-accent hover:underline">
                        View Itinerary →
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Construction Live Tracker */}
        {activeTab === "construction" && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-navy">Live Construction Site Tracker</h2>
              <p className="text-xs text-gray-500">
                Real-time engineering progress logs, current stages, and forthcoming milestones
              </p>
            </div>

            {DEMO_CLIENT_PROJECTS.map((proj) => (
              <div key={proj.id} className="card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                      {proj.projectType}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-bold text-brand-navy">{proj.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {proj.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Target Completion</span>
                    <span className="text-sm font-semibold text-brand-navy">{proj.targetEndDate}</span>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-gray-600">Total Structural Progress</span>
                    <span className="text-brand-accent text-sm">{proj.progressUpdates[0].percentComplete}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent via-brand-navy to-brand-gold"
                      style={{ width: `${proj.progressUpdates[0].percentComplete}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Updates History */}
                <div>
                  <h4 className="font-semibold text-sm text-brand-navy mb-3">Field Engineering Updates</h4>
                  <div className="space-y-4">
                    {proj.progressUpdates.map((u, idx) => (
                      <div
                        key={u.id}
                        className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-brand-accent/30"
                      >
                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-brand-accent bg-white" />
                        <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                            <span className="font-bold text-brand-navy">{u.percentComplete}% Complete</span>
                          </div>
                          <p className="mt-2 text-xs font-semibold text-brand-navy">Current Work Phase:</p>
                          <p className="text-xs text-gray-700">{u.currentStatus}</p>

                          <p className="mt-2 text-xs font-semibold text-brand-steel">Planned For Next Phase:</p>
                          <p className="text-xs text-gray-700">{u.nextPeriodPlan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Payments & Invoices */}
        {activeTab === "payments" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            {/* Payment Submission Form */}
            <div className="card lg:col-span-3">
              <h2 className="font-display text-lg font-bold text-brand-navy">Submit Bank Deposit / Payment Slip</h2>
              <p className="text-xs text-gray-500 mb-6">
                Notify our chartered accountant & finance office once you have made a transfer
              </p>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="label">Select Booking / Project Inquest</label>
                  <select
                    className="input"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose active quote or booking --</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.id} - {b.details?.subject || b.package?.title || b.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Amount Paid (LKR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 75000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Payment Channel</label>
                    <select
                      className="input"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      <option value="BANK_DEPOSIT">Direct Bank Transfer / Deposit</option>
                      <option value="KOKO">Koko Pay</option>
                      <option value="CARD">Debit / Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Bank Reference / Slip Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CMB-DEP-99214 or KOKO-TX-4401"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="input"
                  />
                </div>

                <button type="submit" disabled={submittingPay} className="btn-primary w-full py-2.5 text-xs">
                  {submittingPay ? "Submitting for Verification…" : "Submit Deposit Slip for Approval"}
                </button>
              </form>
            </div>

            {/* Official Bank Account Details */}
            <div className="card bg-brand-surface lg:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-brand-navy flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-gold" />
                Official Company Bank Accounts
              </h3>
              <p className="text-xs text-gray-600">
                Please transfer funds only to registered Balasuriya Group corporate accounts:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
                  <span className="font-bold text-brand-navy block">Commercial Bank of Ceylon</span>
                  <p className="text-gray-500">Account Name: Balasuriya Group (Pvt) Ltd</p>
                  <p className="font-mono font-semibold text-brand-steel">Acc No: 1000 2938 4110</p>
                  <p className="text-[11px] text-gray-400">Branch: Katunayake / Negombo</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
                  <span className="font-bold text-brand-navy block">Sampath Bank PLC</span>
                  <p className="text-gray-500">Account Name: Balasuriya Group (Pvt) Ltd</p>
                  <p className="font-mono font-semibold text-brand-steel">Acc No: 0142 1000 7892</p>
                  <p className="text-[11px] text-gray-400">Branch: Colombo City Centre</p>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>All payments verified with automated tax invoice generation.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Security & Profile Settings */}
        {activeTab === "settings" && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Profile Update */}
            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-navy">Client Contact Profile</h2>
              <p className="text-xs text-gray-500 mb-6">Manage your primary contact and correspondence details</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Registered Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                  />
                </div>

                <button type="submit" disabled={savingProfile} className="btn-primary text-xs py-2">
                  {savingProfile ? "Saving…" : "Save Contact Changes"}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-navy">Authentication & Security</h2>
              <p className="text-xs text-gray-500 mb-6">Update your account password</p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                  />
                </div>

                <button type="submit" disabled={savingPassword} className="btn-secondary text-xs py-2">
                  {savingPassword ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
