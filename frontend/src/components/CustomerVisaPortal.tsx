import { useState, useEffect, type FormEvent } from "react";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  FileText,
  Filter,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plane,
  Printer,
  Search,
  Send,
  Shield,
  Sparkles,
  User,
  X,
  XCircle,
} from "lucide-react";
import type { User as AuthUser, VisaApplication, VisaCategory, VisaStatus } from "../types";
import { api } from "../lib/api";
import { logStaffActivity } from "../lib/activityLogger";
import { contactInfo } from "../data/companyProfile";
import QuickVisaInquiry from "./QuickVisaInquiry";
import toast from "react-hot-toast";

const LOCAL_VISAS_KEY = "bg_client_visa_applications";

export const VISA_DESTINATIONS = [
  {
    country: "India",
    flag: "🇮🇳",
    popularTypes: [
      "30-Day Express Tourist eVisa",
      "1-Year Multiple Entry Tourist eVisa",
      "Commercial Trade & Business eVisa",
      "Conference & Medical Attendant eVisa",
    ],
    processing: "48-72 Hours (Express)",
    feeLkr: "18,500",
  },
  {
    country: "Malaysia",
    flag: "🇲🇾",
    popularTypes: [
      "30-Day Single Entry Tourist eVisa",
      "Multiple Entry Business eVisa",
      "Social Visit Pass & Transit eVisa",
    ],
    processing: "48-72 Hours",
    feeLkr: "22,000",
  },
  {
    country: "Indonesia (Bali & Jakarta)",
    flag: "🇮🇩",
    popularTypes: [
      "Electronic Visa on Arrival (e-VOA 30 Days)",
      "60-Day Tourist Visit Visa (B211A)",
      "Multiple Entry Business Visit Visa",
    ],
    processing: "24-48 Hours",
    feeLkr: "26,500",
  },
  {
    country: "Vietnam",
    flag: "🇻🇳",
    popularTypes: [
      "30-Day Single Entry Tourist eVisa",
      "90-Day Multiple Entry Tourist eVisa",
      "Commercial & Trade Business eVisa (DN1/DN2)",
    ],
    processing: "3-5 Working Days",
    feeLkr: "21,500",
  },
  {
    country: "Cambodia",
    flag: "🇰🇭",
    popularTypes: [
      "Tourist eVisa (Type T - 30 Days)",
      "Ordinary Business eVisa (Type E - 30 Days)",
      "Long-Stay Extension Consultation",
    ],
    processing: "3-4 Working Days",
    feeLkr: "23,000",
  },
  {
    country: "Laos",
    flag: "🇱🇦",
    popularTypes: [
      "Official Tourist eVisa (30 Days)",
      "Business Delegate Entry Visa",
      "Official Transit Visa",
    ],
    processing: "3-5 Working Days",
    feeLkr: "24,000",
  },
  {
    country: "China",
    flag: "🇨🇳",
    popularTypes: [
      "L-Category Tourist Visa (Express)",
      "M-Commercial Trade & Business Visa",
      "F-Non-Commercial Academic & Cultural Visa",
    ],
    processing: "5-7 Working Days",
    feeLkr: "36,000",
  },
  {
    country: "Maldives",
    flag: "🇲🇻",
    popularTypes: [
      "30-Day Tourist Entry Clearance (IMUGA IM16 Assistance)",
      "Business & Corporate Delegate Entry",
      "Expatriate Employment Documentation",
    ],
    processing: "24 Hours (Fast Track)",
    feeLkr: "14,500",
  },
  {
    country: "United Arab Emirates (Dubai & Abu Dhabi)",
    flag: "🇦🇪",
    popularTypes: [
      "30-Day Express Tourist eVisa",
      "60-Day Leisure Holiday eVisa",
      "Multi-Entry Commercial Business eVisa",
      "96-Hour Transit eVisa",
    ],
    processing: "48-72 Hours",
    feeLkr: "38,500",
  },
  {
    country: "United Kingdom (UK)",
    flag: "🇬🇧",
    popularTypes: [
      "Standard Visitor Tourist Visa (6 Months)",
      "Corporate & Business Visitor Visa",
      "Academic & Conference Visa",
    ],
    processing: "15-20 Days",
    feeLkr: "78,000",
  },
  {
    country: "Schengen (Europe - France, Germany, Italy, Switzerland)",
    flag: "🇪🇺",
    popularTypes: [
      "Short-Stay Tourist Schengen Visa (Type C)",
      "Business & Commercial Delegate Visa",
      "Cultural & Sporting Event Visa",
    ],
    processing: "15-25 Days",
    feeLkr: "84,000",
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    popularTypes: [
      "30-Day Tourist e-Visa",
      "Multiple Journey Business Visa",
      "Transit Visa Facility (VFTF)",
    ],
    processing: "3-5 Working Days",
    feeLkr: "24,500",
  },
  {
    country: "Australia & New Zealand",
    flag: "🇦🇺",
    popularTypes: [
      "Subclass 600 Tourist Stream",
      "Subclass 600 Business Visitor Stream",
      "New Zealand Visitor Visa",
    ],
    processing: "20-30 Days",
    feeLkr: "88,000",
  },
  {
    country: "United States (USA)",
    flag: "🇺🇸",
    popularTypes: [
      "B1/B2 Tourism & Business Visitor Documentation",
      "DS-160 Filing & Embassy Appointment Scheduling",
    ],
    processing: "Embassy Slot Dependent",
    feeLkr: "96,000",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    popularTypes: [
      "Temporary Resident Visa (TRV - Tourist)",
      "Business Delegation & Conference Visa",
    ],
    processing: "30-45 Days",
    feeLkr: "89,000",
  },
  {
    country: "Japan & South Korea",
    flag: "🇯🇵",
    popularTypes: [
      "Short-Term Tourism Visa (Single Entry)",
      "Commercial & Business Partner Visa",
      "South Korea C-3-9 Tourist Visa",
    ],
    processing: "7-10 Days",
    feeLkr: "34,000",
  },
  {
    country: "Thailand",
    flag: "🇹🇭",
    popularTypes: [
      "60-Day Tourist Visa (Single Entry)",
      "Electronic Visa on Arrival (e-VOA 30 Days)",
      "Business & Meeting eVisa",
    ],
    processing: "24-48 Hours",
    feeLkr: "19,500",
  },
  {
    country: "Saudi Arabia & Qatar",
    flag: "🇸🇦",
    popularTypes: [
      "1-Year Multiple Entry Tourist eVisa",
      "Umrah & Transit eVisa",
      "Business Commercial Visa",
    ],
    processing: "24-48 Hours",
    feeLkr: "44,000",
  },
];

const INITIAL_DEMO_VISAS: VisaApplication[] = [
  {
    id: "visa_demo_1",
    referenceNo: "BG-VISA-2026-8812",
    userEmail: "client@balasuriyagroup.tech",
    userName: "Deshamanya Rohan De Silva",
    phone: "+94 77 123 4567",
    country: "United Arab Emirates (Dubai & Abu Dhabi)",
    countryFlag: "🇦🇪",
    category: "TOURIST",
    visaTypeLabel: "30-Day Express Tourist eVisa",
    entryType: "SINGLE",
    passportNumber: "N8921456",
    passportExpiry: "2029-11-20",
    passportIssueDate: "2019-11-21",
    nationality: "Sri Lankan",
    dateOfBirth: "1984-06-14",
    gender: "MALE",
    occupation: "Managing Director",
    employerName: "De Silva Logistics Ltd",
    intendedArrivalDate: "2026-11-10",
    intendedDepartureDate: "2026-11-24",
    stayDurationDays: 14,
    destinationAddress: "Grand Hyatt Hotel, Dubai Creek, UAE",
    notes: "Family holiday visit & Dubai Expo tour. White background photo and confirmed return flight ticket confirmed.",
    documentSummary: "Passport Bio-page + White BG Photo + CMB-DXB Confirmed Ticket",
    status: "UNDER_REVIEW",
    statusNotes: "Documents verified by Balasuriya Visa Desk. Ready for General Directorate of Residency (GDRFA) submission.",
    submittedAt: "2026-10-12T09:30:00.000Z",
    updatedAt: "2026-10-14T11:20:00.000Z",
    canEdit: true,
  },
  {
    id: "visa_demo_2",
    referenceNo: "BG-VISA-2026-9403",
    userEmail: "client@balasuriyagroup.tech",
    userName: "Deshamanya Rohan De Silva",
    phone: "+94 77 123 4567",
    country: "United Kingdom (UK)",
    countryFlag: "🇬🇧",
    category: "BUSINESS",
    visaTypeLabel: "Corporate & Business Visitor Visa (6 Months)",
    entryType: "MULTIPLE",
    passportNumber: "N8921456",
    passportExpiry: "2029-11-20",
    nationality: "Sri Lankan",
    dateOfBirth: "1984-06-14",
    occupation: "Managing Director",
    employerName: "De Silva Logistics Ltd",
    intendedArrivalDate: "2026-12-05",
    intendedDepartureDate: "2026-12-18",
    stayDurationDays: 13,
    destinationAddress: "Hilton London Bankside, 2-8 Great Suffolk St, London SE1",
    sponsorCompany: "Global Maritime Logistics UK PLC",
    sponsorContact: "Mr. James Wright (+44 20 7946 0912)",
    meetingPurpose: "Annual shipping conference & commercial contract renewal talks with UK partners.",
    notes: "Formal corporate sponsorship invitation letter & audited bank statements uploaded.",
    documentSummary: "UK Sponsor Invitation + 6-Month Bank Statements + Tax Certification",
    status: "SUBMITTED",
    statusNotes: "Application lodged online. Initial compliance check scheduled by Head of Visa Services.",
    submittedAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-15T08:00:00.000Z",
    canEdit: true,
  },
];

function getStoredVisas(): VisaApplication[] {
  try {
    const raw = localStorage.getItem(LOCAL_VISAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function persistVisas(list: VisaApplication[]): void {
  try {
    localStorage.setItem(LOCAL_VISAS_KEY, JSON.stringify(list));
  } catch {}
}

interface Props {
  user: AuthUser | null;
  onOpenNewModalDirectly?: boolean;
}

export default function CustomerVisaPortal({ user }: Props) {
  const [visas, setVisas] = useState<VisaApplication[]>(() => {
    const stored = getStoredVisas();
    return stored.length > 0 ? stored : INITIAL_DEMO_VISAS;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaApplication | null>(null);
  const [viewingSlip, setViewingSlip] = useState<VisaApplication | null>(null);

  // Send an existing visa application summary to balasuriyagroup.info@gmail.com
  async function handleSendAppToEmail(app: VisaApplication) {
    try {
      toast.loading("Emailing application to balasuriyagroup.info@gmail.com...", { id: "email_dispatch" });
      await api.post("/api/inquiries", {
        division: "VISA",
        name: app.userName,
        email: app.userEmail,
        phone: app.phone,
        subject: `Visa Application Summary [${app.referenceNo}]: ${app.country} (${app.userName})`,
        message: `Visa Application Reference: ${app.referenceNo}\nStatus: ${app.status}\nCountry: ${app.country}\nCategory: ${app.category}\nPassport No: ${app.passportNumber} (Expiry: ${app.passportExpiry})\nIntended Arrival: ${app.intendedArrivalDate}\nStay Duration: ${app.stayDurationDays || 15} Days\nDestination/Sponsor: ${app.destinationAddress || app.sponsorCompany || "N/A"}\nNotes: ${app.notes || "None"}`,
        details: {
          referenceNo: app.referenceNo,
          status: app.status,
          country: app.country,
          category: app.category,
          passportNumber: app.passportNumber,
          intendedArrivalDate: app.intendedArrivalDate,
        },
      });
      toast.success("Application details emailed to balasuriyagroup.info@gmail.com!", { id: "email_dispatch" });
    } catch {
      const subject = encodeURIComponent(`Visa Application [${app.referenceNo}]: ${app.country} (${app.userName})`);
      const body = encodeURIComponent(`Reference: ${app.referenceNo}\nApplicant: ${app.userName}\nPassport: ${app.passportNumber}\nCountry: ${app.country}\nArrival: ${app.intendedArrivalDate}`);
      window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
      toast.success("Opening email client to dispatch to balasuriyagroup.info@gmail.com", { id: "email_dispatch" });
    }
  }

  // New Application Form State
  const [destCountry, setDestCountry] = useState(VISA_DESTINATIONS[0].country);
  const [category, setCategory] = useState<VisaCategory>("TOURIST");
  const [visaTypeLabel, setVisaTypeLabel] = useState(VISA_DESTINATIONS[0].popularTypes[0]);
  const [entryType, setEntryType] = useState<"SINGLE" | "MULTIPLE">("SINGLE");

  const [applicantName, setApplicantName] = useState(user?.name || "");
  const [applicantEmail, setApplicantEmail] = useState(user?.email || "");
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "+94 77 000 0000");

  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("2029-12-31");
  const [passportIssueDate, setPassportIssueDate] = useState("2020-01-15");
  const [nationality, setNationality] = useState("Sri Lankan");
  const [dateOfBirth, setDateOfBirth] = useState("1990-05-20");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [occupation, setOccupation] = useState("Business Professional");
  const [employerName, setEmployerName] = useState("");

  const [intendedArrivalDate, setIntendedArrivalDate] = useState("2026-11-20");
  const [intendedDepartureDate, setIntendedDepartureDate] = useState("2026-12-05");
  const [stayDurationDays, setStayDurationDays] = useState(15);
  const [destinationAddress, setDestinationAddress] = useState("");

  // Business specific fields
  const [sponsorCompany, setSponsorCompany] = useState("");
  const [sponsorContact, setSponsorContact] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState("");

  const [notes, setNotes] = useState("");
  const [documentSummary, setDocumentSummary] = useState("Passport Bio-page + White BG Photograph");
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassportNumber, setEditPassportNumber] = useState("");
  const [editPassportExpiry, setEditPassportExpiry] = useState("");
  const [editPassportIssueDate, setEditPassportIssueDate] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editEmployerName, setEditEmployerName] = useState("");
  const [editArrivalDate, setEditArrivalDate] = useState("");
  const [editDepartureDate, setEditDepartureDate] = useState("");
  const [editStayDuration, setEditStayDuration] = useState(15);
  const [editAddress, setEditAddress] = useState("");
  const [editSponsorCompany, setEditSponsorCompany] = useState("");
  const [editSponsorContact, setEditSponsorContact] = useState("");
  const [editMeetingPurpose, setEditMeetingPurpose] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Update country presets
  function handleSelectCountry(countryName: string) {
    setDestCountry(countryName);
    const match = VISA_DESTINATIONS.find((d) => d.country === countryName);
    if (match && match.popularTypes.length > 0) {
      setVisaTypeLabel(match.popularTypes[0]);
    }
  }

  // Fetch visas from API or sync
  useEffect(() => {
    api
      .get<{ applications: VisaApplication[] }>("/api/visas")
      .then((res) => {
        if (res.data.applications && res.data.applications.length > 0) {
          const stored = getStoredVisas();
          const combinedMap = new Map<string, VisaApplication>();
          for (const s of stored) combinedMap.set(s.id, s);
          for (const a of res.data.applications) {
            if (!combinedMap.has(a.id)) combinedMap.set(a.id, a);
          }
          const merged = Array.from(combinedMap.values());
          setVisas(merged);
          persistVisas(merged);
        }
      })
      .catch(() => {
        const stored = getStoredVisas();
        if (stored.length === 0) {
          setVisas(INITIAL_DEMO_VISAS);
          persistVisas(INITIAL_DEMO_VISAS);
        }
      });
  }, []);

  // Handle New Visa Application Submission
  async function handleCreateVisaApplication(e: FormEvent) {
    e.preventDefault();
    if (!passportNumber.trim()) {
      toast.error("Please enter a valid passport number.");
      return;
    }
    setSubmitting(true);

    const destObj = VISA_DESTINATIONS.find((d) => d.country === destCountry);
    const countryFlag = destObj?.flag || "🌐";
    const refNo = `BG-VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: VisaApplication = {
      id: `visa_${Date.now()}`,
      referenceNo: refNo,
      userEmail: applicantEmail.toLowerCase().trim() || user?.email || "client@balasuriyagroup.tech",
      userName: applicantName.trim() || user?.name || "Client Applicant",
      phone: applicantPhone.trim() || user?.phone || "+94 77 000 0000",
      country: destCountry,
      countryFlag,
      category,
      visaTypeLabel,
      entryType,
      passportNumber: passportNumber.toUpperCase().trim(),
      passportExpiry,
      passportIssueDate,
      nationality,
      dateOfBirth,
      gender,
      occupation,
      employerName,
      intendedArrivalDate,
      intendedDepartureDate,
      stayDurationDays: Number(stayDurationDays) || 15,
      destinationAddress,
      sponsorCompany: category === "BUSINESS" ? sponsorCompany : undefined,
      sponsorContact: category === "BUSINESS" ? sponsorContact : undefined,
      meetingPurpose: category === "BUSINESS" ? meetingPurpose : undefined,
      notes,
      documentSummary,
      status: "SUBMITTED",
      statusNotes: "Application submitted online. Preliminary document check underway by Balasuriya Visa Desk.",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canEdit: true,
    };

    try {
      await api.post("/api/visas", newApp);
    } catch {
      // Offline / fallback storage continues
    }

    setVisas((prev) => {
      const next = [newApp, ...prev];
      persistVisas(next);
      return next;
    });

    logStaffActivity({
      division: "TICKETING",
      title: `Submitted Online Visa Application for ${destCountry} (${refNo})`,
      actor: user?.name || applicantName,
      actorRole: "Client Applicant",
      badgeColor: "bg-sky-100 text-sky-900",
      details: `Category: ${category} eVisa, Passport: ${newApp.passportNumber}, Travel Date: ${intendedArrivalDate}.`,
    });

    toast.success(`Online visa application submitted! Reference: ${refNo}`);
    setIsNewModalOpen(false);
    setPassportNumber("");
    setNotes("");
    setSubmitting(false);
  }

  // Handle Opening Edit Modal
  function handleStartEdit(app: VisaApplication) {
    setEditingVisa(app);
    setEditName(app.userName);
    setEditPhone(app.phone);
    setEditPassportNumber(app.passportNumber);
    setEditPassportExpiry(app.passportExpiry);
    setEditPassportIssueDate(app.passportIssueDate || "2020-01-15");
    setEditNationality(app.nationality);
    setEditDateOfBirth(app.dateOfBirth || "1990-01-01");
    setEditOccupation(app.occupation || "");
    setEditEmployerName(app.employerName || "");
    setEditArrivalDate(app.intendedArrivalDate);
    setEditDepartureDate(app.intendedDepartureDate || "");
    setEditStayDuration(app.stayDurationDays || 15);
    setEditAddress(app.destinationAddress || "");
    setEditSponsorCompany(app.sponsorCompany || "");
    setEditSponsorContact(app.sponsorContact || "");
    setEditMeetingPurpose(app.meetingPurpose || "");
    setEditNotes(app.notes || "");
  }

  // Handle Saving Edited Application Details
  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingVisa) return;
    setEditSubmitting(true);

    const updatedApp: VisaApplication = {
      ...editingVisa,
      userName: editName.trim(),
      phone: editPhone.trim(),
      passportNumber: editPassportNumber.toUpperCase().trim(),
      passportExpiry: editPassportExpiry,
      passportIssueDate: editPassportIssueDate,
      nationality: editNationality,
      dateOfBirth: editDateOfBirth,
      occupation: editOccupation,
      employerName: editEmployerName,
      intendedArrivalDate: editArrivalDate,
      intendedDepartureDate: editDepartureDate,
      stayDurationDays: Number(editStayDuration),
      destinationAddress: editAddress,
      sponsorCompany: editingVisa.category === "BUSINESS" ? editSponsorCompany : undefined,
      sponsorContact: editingVisa.category === "BUSINESS" ? editSponsorContact : undefined,
      meetingPurpose: editingVisa.category === "BUSINESS" ? editMeetingPurpose : undefined,
      notes: editNotes,
      updatedAt: new Date().toISOString(),
      statusNotes: `Updated by applicant on ${new Date().toLocaleDateString()}. Preliminary review refreshed.`,
    };

    try {
      await api.patch(`/api/visas/${editingVisa.id}`, updatedApp);
    } catch {}

    setVisas((prev) => {
      const next = prev.map((v) => (v.id === editingVisa.id ? updatedApp : v));
      persistVisas(next);
      return next;
    });

    logStaffActivity({
      division: "TICKETING",
      title: `Updated Visa Application Details for ${editingVisa.country} (${editingVisa.referenceNo})`,
      actor: user?.name || editName,
      actorRole: "Client Applicant",
      badgeColor: "bg-indigo-100 text-indigo-900",
      details: `Applicant revised travel dates (${editArrivalDate}) and passport info.`,
    });

    toast.success(`Visa details for ${editingVisa.country} updated successfully!`);
    setEditSubmitting(false);
    setEditingVisa(null);
  }

  // Filter visas
  const filteredVisas = visas.filter((v) => {
    if (categoryFilter !== "ALL" && v.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = v.referenceNo.toLowerCase().includes(q);
      const matchCountry = v.country.toLowerCase().includes(q);
      const matchName = v.userName.toLowerCase().includes(q);
      const matchPass = v.passportNumber.toLowerCase().includes(q);
      return matchRef || matchCountry || matchName || matchPass;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Official Division Header Banner with Logo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src="/images/foreign-tours-air-tickets-visa.jpg"
              alt="Balasuriya Group - Foreign Tours • Air Ticket Booking • Visa"
              className="h-20 w-auto rounded-xl object-contain border border-gray-100 p-1 shadow-sm shrink-0 bg-white"
            />
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3 py-0.5 text-[11px] font-bold text-brand-navy">
                <Globe className="h-3.5 w-3.5 text-brand-gold" />
                Foreign Tours • Air Ticket Booking • Visa Division
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-brand-navy">
                Online Visa Applications Bureau
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 max-w-xl">
                Bespoke immigration document processing for Tourist eVisas, Corporate & Business Visas, Transit Permits,
                and Embassy Submissions across 50+ global jurisdictions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsExpressModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-2.5 text-xs font-bold text-brand-navy hover:bg-brand-gold/20 transition shadow-xs"
            >
              <Send className="h-3.5 w-3.5 text-brand-gold" />
              Quick Inquiry (WhatsApp / Email)
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-brand-gold" />
              + Apply for Online Visa
            </button>
          </div>
        </div>

        {/* Quick Visa Benefits Pill Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-4 text-[11px]">
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>48-72h Fast-Track eVisa</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Flexible Details Amendment</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>IATA Ticket & Hotel Integration</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Direct WhatsApp Desk Support</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Visas" },
            { id: "TOURIST", label: "🏖️ Tourist eVisas" },
            { id: "BUSINESS", label: "💼 Business Visas" },
            { id: "TRANSIT", label: "✈️ Transit Visas" },
            { id: "STUDENT", label: "🎓 Student Visas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                categoryFilter === tab.id
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country, ref, passport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredVisas.length === 0 ? (
          <div className="card text-center py-12">
            <Globe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-brand-navy text-base">No Visa Applications Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              You haven't submitted any visa requests in this category yet. Click below to start an online application
              for Dubai, UK, Singapore, Europe, and more.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="btn-primary text-xs py-2 px-5 mt-4 inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
              Apply for Online Visa Now
            </button>
          </div>
        ) : (
          filteredVisas.map((app) => {
            const isEditable =
              app.canEdit !== false &&
              app.status !== "APPROVED" &&
              app.status !== "EMBASSY_PROCESSING";

            return (
              <div key={app.id} className="card p-5 hover:shadow-md transition space-y-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{app.countryFlag}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-base text-brand-navy">{app.country}</h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            app.category === "BUSINESS"
                              ? "bg-purple-100 text-purple-900 border border-purple-200"
                              : "bg-sky-100 text-sky-900 border border-sky-200"
                          }`}
                        >
                          {app.category === "BUSINESS" ? "💼 Business Visa" : "🏖️ Tourist eVisa"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{app.visaTypeLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(app.referenceNo);
                        toast.success("Reference number copied to clipboard!");
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 px-2.5 py-1 text-xs font-mono font-semibold text-gray-700 transition"
                      title="Copy Reference"
                    >
                      <Copy className="h-3 w-3 text-gray-500" />
                      {app.referenceNo}
                    </button>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        app.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "UNDER_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : app.status === "EMBASSY_PROCESSING"
                          ? "bg-indigo-100 text-indigo-800"
                          : app.status === "DOCS_REQUIRED"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {app.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                      {app.status === "UNDER_REVIEW" && <Clock className="h-3 w-3" />}
                      {app.status === "DOCS_REQUIRED" && <AlertCircle className="h-3 w-3" />}
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl bg-slate-50/80 p-3.5 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Primary Applicant</span>
                    <span className="font-semibold text-brand-navy block truncate">{app.userName}</span>
                    <span className="text-gray-500 text-[11px] font-mono">
                      Pass: {app.passportNumber} ({app.nationality})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Travel Schedule</span>
                    <span className="font-semibold text-brand-navy block">
                      Arrival: {app.intendedArrivalDate}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Duration: {app.stayDurationDays || 15} Days ({app.entryType} Entry)
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      {app.category === "BUSINESS" ? "Sponsoring Organization" : "Destination Stay"}
                    </span>
                    <span className="font-semibold text-brand-navy block truncate">
                      {app.category === "BUSINESS" ? app.sponsorCompany || "Corporate Sponsor" : app.destinationAddress || "Hotel Booking"}
                    </span>
                    <span className="text-gray-500 text-[11px] truncate block">
                      {app.category === "BUSINESS" ? app.meetingPurpose || "Commercial Business" : "Colombo — Overseas Itinerary"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Officer Notes & Status</span>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                      {app.statusNotes || "Application lodged. Verification in progress."}
                    </p>
                  </div>
                </div>

                {/* Amendment window banner & Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {isEditable ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Amendment Window Open (Details Editable)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        <Shield className="h-3 w-3" />
                        Embassy Lodged / Locked for Changes
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(app)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                        title="Edit applicant information, passport details, or dates"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Application Details
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setViewingSlip(app)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-gray-50 transition"
                      title="View Official Registration Slip"
                    >
                      <FileText className="h-3.5 w-3.5 text-brand-gold" />
                      View Official Slip
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendAppToEmail(app)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition"
                      title="Send application summary to balasuriyagroup.info@gmail.com"
                    >
                      <Mail className="h-3.5 w-3.5 text-sky-600" />
                      Email Bureau
                    </button>

                    <a
                      href={`https://wa.me/94767171938?text=Hello%20Balasuriya%20Visa%20Bureau,%20I%20am%20inquiring%20about%20my%20Visa%20Application%20Ref:%20${encodeURIComponent(
                        app.referenceNo
                      )}%20for%20${encodeURIComponent(app.country)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      WhatsApp Desk
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW VISA APPLICATION MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]">
              {/* Modal Header */}
              <div className="bg-brand-navy p-5 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/foreign-tours-air-tickets-visa.jpg"
                    alt="Balasuriya Group Logo"
                    className="h-10 w-auto rounded-lg bg-white p-0.5"
                  />
                  <div>
                    <h3 className="font-display font-bold text-base">Online Visa Application Portal</h3>
                    <p className="text-xs text-white/70">
                      Balasuriya Group Foreign Tours, Air Ticket Booking &amp; Visa Bureau
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateVisaApplication} className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Section 1: Destination & Visa Category */}
                <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> 1. Destination Country & Visa Category
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Destination Country</label>
                    <select
                      value={destCountry}
                      onChange={(e) => handleSelectCountry(e.target.value)}
                      className="input text-xs"
                      required
                    >
                      {VISA_DESTINATIONS.map((d) => (
                        <option key={d.country} value={d.country}>
                          {d.flag} {d.country} ({d.processing})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Visa Purpose / Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VisaCategory)}
                      className="input text-xs font-semibold"
                    >
                      <option value="TOURIST">🏖️ Tourist & Holiday eVisa</option>
                      <option value="BUSINESS">💼 Corporate & Business Visa</option>
                      <option value="TRANSIT">✈️ Airport Transit Visa</option>
                      <option value="STUDENT">🎓 Student / Conference Visa</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Specific Visa Type / Class</label>
                    <input
                      type="text"
                      required
                      value={visaTypeLabel}
                      onChange={(e) => setVisaTypeLabel(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. 30-Day Express Tourist eVisa"
                    />
                  </div>

                  <div>
                    <label className="label">Entry Permit Type</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="entryType"
                          checked={entryType === "SINGLE"}
                          onChange={() => setEntryType("SINGLE")}
                          className="text-brand-navy"
                        />
                        Single Entry
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="entryType"
                          checked={entryType === "MULTIPLE"}
                          onChange={() => setEntryType("MULTIPLE")}
                          className="text-brand-navy"
                        />
                        Multiple Entry
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Applicant & Passport Information */}
              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                  <User className="h-4 w-4" /> 2. Primary Applicant & Passport Data
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="label">Full Name (Exactly as in Passport)</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. Rohan Sandun De Silva"
                    />
                  </div>

                  <div>
                    <label className="label">Passport Number</label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="input text-xs font-mono font-bold uppercase"
                      placeholder="e.g. N8921456"
                    />
                  </div>

                  <div>
                    <label className="label">Passport Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="input text-xs"
                    />
                    <span className="text-[10px] text-gray-400">Must be valid &gt; 6 months</span>
                  </div>

                  <div>
                    <label className="label">Passport Issue Date</label>
                    <input
                      type="date"
                      value={passportIssueDate}
                      onChange={(e) => setPassportIssueDate(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Nationality</label>
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="input text-xs"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Occupation / Profession</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. Senior Architect"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="label">Employer or Business Enterprise Name</label>
                    <input
                      type="text"
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. Balasuriya Engineering (Pvt) Ltd"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Travel Schedule & Business Sponsor */}
              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                  <Plane className="h-4 w-4" /> 3. Travel Dates, Accommodation & Sponsor
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Intended Arrival Date</label>
                    <input
                      type="date"
                      required
                      value={intendedArrivalDate}
                      onChange={(e) => setIntendedArrivalDate(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Intended Departure Date</label>
                    <input
                      type="date"
                      value={intendedDepartureDate}
                      onChange={(e) => setIntendedDepartureDate(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Stay Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={stayDurationDays}
                      onChange={(e) => setStayDurationDays(Number(e.target.value))}
                      className="input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">Destination Hotel / Residential Address</label>
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. Hilton Dubai Creek, Al Seef District, UAE"
                    />
                  </div>

                  <div>
                    <label className="label">WhatsApp / Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="input text-xs"
                    />
                  </div>

                  {/* Business specific section */}
                  {category === "BUSINESS" && (
                    <div className="sm:col-span-3 rounded-xl bg-purple-50/70 border border-purple-200 p-4 space-y-3">
                      <h5 className="font-bold text-xs text-purple-900 flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> Corporate Sponsorship & Business Meeting Details
                      </h5>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label">Host Company / Sponsor Name</label>
                          <input
                            type="text"
                            required={category === "BUSINESS"}
                            value={sponsorCompany}
                            onChange={(e) => setSponsorCompany(e.target.value)}
                            className="input text-xs bg-white"
                            placeholder="e.g. Emirates Global Aluminium"
                          />
                        </div>
                        <div>
                          <label className="label">Sponsor Representative & Phone</label>
                          <input
                            type="text"
                            value={sponsorContact}
                            onChange={(e) => setSponsorContact(e.target.value)}
                            className="input text-xs bg-white"
                            placeholder="e.g. Tariq Al-Mansoor (+971 4 000 0000)"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Commercial Purpose of Visit</label>
                          <input
                            type="text"
                            value={meetingPurpose}
                            onChange={(e) => setMeetingPurpose(e.target.value)}
                            className="input text-xs bg-white"
                            placeholder="e.g. Signing trade partnership and equipment procurement"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-3">
                    <label className="label">Supporting Documents & Special Requirements</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input text-xs"
                      placeholder="e.g. White background photo attached, return air ticket confirmed with Balasuriya Air Ticketing Bureau."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[11px] text-gray-400">
                  You can amend or update details anytime before official embassy submission.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-6"
                  >
                    {submitting ? "Lodging Application…" : "Submit Visa Application"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* EDIT VISA APPLICATION MODAL (User Edit Window) */}
      {editingVisa && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]">
              {/* Header */}
              <div className="bg-brand-navy p-5 text-white flex items-center justify-between flex-shrink-0">
                <div>
                  <span className="rounded bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                    Ref: {editingVisa.referenceNo}
                  </span>
                  <h3 className="font-display font-bold text-base mt-1">
                    Edit Visa Application Details — {editingVisa.country}
                  </h3>
                  <p className="text-xs text-white/70">
                    Amend passport numbers, travel schedules, host details, or notes before embassy lodging.
                  </p>
                </div>
                <button
                  onClick={() => setEditingVisa(null)}
                  className="rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <p className="font-semibold">Amendment Window Open</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Update your passport information, travel dates, or business sponsor details below. Once saved,
                  our visa compliance officers will inspect the revised data.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Applicant Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Passport Number</label>
                  <input
                    type="text"
                    required
                    value={editPassportNumber}
                    onChange={(e) => setEditPassportNumber(e.target.value)}
                    className="input text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="label">Passport Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editPassportExpiry}
                    onChange={(e) => setEditPassportExpiry(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Nationality</label>
                  <input
                    type="text"
                    value={editNationality}
                    onChange={(e) => setEditNationality(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Occupation</label>
                  <input
                    type="text"
                    value={editOccupation}
                    onChange={(e) => setEditOccupation(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Intended Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={editArrivalDate}
                    onChange={(e) => setEditArrivalDate(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Intended Departure Date</label>
                  <input
                    type="date"
                    value={editDepartureDate}
                    onChange={(e) => setEditDepartureDate(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Hotel or Host Address in Destination</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                {editingVisa.category === "BUSINESS" && (
                  <>
                    <div>
                      <label className="label">Sponsoring Company</label>
                      <input
                        type="text"
                        value={editSponsorCompany}
                        onChange={(e) => setEditSponsorCompany(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">Meeting Purpose</label>
                      <input
                        type="text"
                        value={editMeetingPurpose}
                        onChange={(e) => setEditMeetingPurpose(e.target.value)}
                        className="input text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="label">Additional Notes or Document Explanations</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingVisa(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {editSubmitting ? "Saving Updates…" : "Save & Update Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* OFFICIAL VISA APPLICATION SLIP MODAL (Printable Acknowledgement) */}
      {viewingSlip && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <div className="w-full max-w-2xl my-auto rounded-2xl bg-white shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* Printable Slip Header */}
            <div className="flex items-center justify-between border-b-2 border-brand-navy pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/foreign-tours-air-tickets-visa.jpg"
                  alt="Balasuriya Group Logo"
                  className="h-14 w-auto rounded-lg object-contain"
                />
                <div>
                  <h2 className="font-display font-bold text-lg text-brand-navy tracking-tight">
                    BALASURIYA GROUP
                  </h2>
                  <p className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
                    FOREIGN TOURS • AIR TICKET BOOKING • VISA BUREAU
                  </p>
                  <p className="text-[10px] text-gray-500">
                    CIDA & IATA Aligned • Head Office: Andiambalama, Western Province, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs font-mono font-bold text-brand-navy">
                  {viewingSlip.referenceNo}
                </span>
                <span className="text-[10px] text-gray-500">
                  Lodged: {new Date(viewingSlip.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Slip Document Title */}
            <div className="text-center bg-slate-50 rounded-xl p-3 border border-gray-200">
              <span className="text-xs uppercase font-bold text-brand-accent tracking-widest">
                Official Registration Receipt
              </span>
              <h3 className="font-display font-bold text-base text-brand-navy mt-0.5">
                {viewingSlip.countryFlag} {viewingSlip.country} — {viewingSlip.visaTypeLabel}
              </h3>
            </div>

            {/* Slip Details Table */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border border-gray-100 p-3 space-y-1.5">
                <h4 className="font-bold text-brand-navy text-[11px] uppercase">Applicant Data</h4>
                <p>
                  <strong className="text-gray-500">Full Name:</strong> {viewingSlip.userName}
                </p>
                <p>
                  <strong className="text-gray-500">Passport Number:</strong> {viewingSlip.passportNumber}
                </p>
                <p>
                  <strong className="text-gray-500">Passport Expiry:</strong> {viewingSlip.passportExpiry}
                </p>
                <p>
                  <strong className="text-gray-500">Nationality:</strong> {viewingSlip.nationality}
                </p>
                <p>
                  <strong className="text-gray-500">Profession:</strong> {viewingSlip.occupation || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 p-3 space-y-1.5">
                <h4 className="font-bold text-brand-navy text-[11px] uppercase">Travel & Itinerary</h4>
                <p>
                  <strong className="text-gray-500">Arrival Date:</strong> {viewingSlip.intendedArrivalDate}
                </p>
                <p>
                  <strong className="text-gray-500">Departure Date:</strong>{" "}
                  {viewingSlip.intendedDepartureDate || "Open Return"}
                </p>
                <p>
                  <strong className="text-gray-500">Permit Type:</strong> {viewingSlip.entryType} Entry
                </p>
                <p>
                  <strong className="text-gray-500">Current Status:</strong>{" "}
                  <span className="font-bold text-brand-navy">{viewingSlip.status.replace(/_/g, " ")}</span>
                </p>
                <p>
                  <strong className="text-gray-500">Contact:</strong> {viewingSlip.phone}
                </p>
              </div>
            </div>

            {viewingSlip.category === "BUSINESS" && viewingSlip.sponsorCompany && (
              <div className="rounded-lg bg-purple-50/70 border border-purple-200 p-3 text-xs text-purple-950">
                <strong className="block text-[11px] uppercase font-bold text-purple-900">
                  Business Sponsorship
                </strong>
                <p className="mt-1">
                  <strong>Sponsor:</strong> {viewingSlip.sponsorCompany}
                  {viewingSlip.sponsorContact ? ` (${viewingSlip.sponsorContact})` : ""}
                </p>
                {viewingSlip.meetingPurpose && (
                  <p>
                    <strong>Purpose:</strong> {viewingSlip.meetingPurpose}
                  </p>
                )}
              </div>
            )}

            {/* Official Seal / Disclaimer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[11px] text-gray-500">
              <div>
                <p className="font-bold text-brand-navy">Balasuriya Group Global Visa Desk</p>
                <p>Inquiries: security@balasuriyagroup.tech | +94 76 7171 938</p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  ✓ VERIFIED & REGISTERED
                </span>
              </div>
            </div>

            {/* Slip Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/94767171938?text=Hello%20Balasuriya%20Visa%20Bureau,%20here%20is%20my%20Visa%20Application%20Ref:%20${encodeURIComponent(
                    viewingSlip.referenceNo
                  )}%20(${encodeURIComponent(viewingSlip.userName)}%20-%20${encodeURIComponent(viewingSlip.country)}).`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  Send to WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => handleSendAppToEmail(viewingSlip)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition shadow-2xs"
                >
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  Email to balasuriyagroup.info@gmail.com
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingSlip(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Express Inquiry Modal */}
      {isExpressModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6">
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <div className="relative w-full max-w-2xl my-auto">
              <button
                onClick={() => setIsExpressModalOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-gray-400 hover:text-gray-700 shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
              <QuickVisaInquiry compact onSuccess={() => setIsExpressModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
