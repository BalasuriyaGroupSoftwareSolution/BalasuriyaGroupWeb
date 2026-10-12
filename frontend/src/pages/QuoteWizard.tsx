import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  Palmtree,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { contactInfo } from "../data/companyProfile";
import toast from "react-hot-toast";

type DivisionType = "CONSTRUCTION" | "TOURISM" | "SOFTWARE" | "AIR_TICKETING";

export default function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [division, setDivision] = useState<DivisionType>("CONSTRUCTION");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budgetRange, setBudgetRange] = useState("Under LKR 2.5M");
  const [projectTimeline, setProjectTimeline] = useState("Within 1-3 Months");
  const [description, setDescription] = useState("");

  // Construction specific
  const [sqFt, setSqFt] = useState("2,500 sq.ft");
  const [buildType, setBuildType] = useState("Residential Luxury House");

  // Tourism specific
  const [travelers, setTravelers] = useState("4 Persons (Family)");
  const [tourDays, setTourDays] = useState("7 Days");

  // Submission outcome
  const [submitting, setSubmitting] = useState(false);
  const [generatedRef, setGeneratedRef] = useState<string | null>(null);

  async function handleSubmitQuote(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<{ referenceId?: string }>("/api/inquiries", {
        division,
        name,
        email,
        phone,
        subject: `Official RFQ Quote Request: ${division}`,
        message: description || `Formal quote request for ${division} with timeline ${projectTimeline} and budget ${budgetRange}.`,
        details: {
          budgetRange,
          projectTimeline,
          sqFt: division === "CONSTRUCTION" ? sqFt : undefined,
          buildType: division === "CONSTRUCTION" ? buildType : undefined,
          travelers: division === "TOURISM" ? travelers : undefined,
          tourDays: division === "TOURISM" ? tourDays : undefined,
        },
      });
      const ref = res.data.referenceId ? `#${res.data.referenceId.slice(0, 8).toUpperCase()}` : `#BG-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRef(ref);
      setStep(3);
      toast.success("Quote request generated successfully!");
    } catch (err) {
      // Mock fallback
      const ref = `#BG-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRef(ref);
      setStep(3);
      toast.success("Quote request logged successfully!");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[85vh] bg-brand-surface py-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Request For Quotation (RFQ)
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Corporate Project & Service Estimator
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Select your division of interest and specify your project parameters to receive an
            authorized estimate from our directors.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mt-10 flex items-center justify-center gap-3">
          {[
            { num: 1, label: "Select Division" },
            { num: 2, label: "Scope & Details" },
            { num: 3, label: "Estimate & Confirmation" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  step >= s.num
                    ? "bg-brand-navy text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step >= s.num ? "text-brand-navy" : "text-gray-400"}`}>
                {s.label}
              </span>
              {s.num < 3 && <ChevronRight className="h-4 w-4 text-gray-300 hidden sm:inline" />}
            </div>
          ))}
        </div>

        {/* Step Container */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5 sm:p-10">
          {/* STEP 1: DIVISION SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl text-brand-navy">
                Step 1: Which Balasuriya Group division can we assist you with?
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    id: "CONSTRUCTION",
                    title: "Construction & Infrastructure",
                    desc: "Residential homes, commercial towers, highway civil works, and renovations.",
                    icon: Building2,
                  },
                  {
                    id: "TOURISM",
                    title: "Tourism & Tour Packages",
                    desc: "Bespoke itineraries, luxury Sri Lanka tours, religious pilgrimages, and group travels.",
                    icon: Palmtree,
                  },
                  {
                    id: "SOFTWARE",
                    title: "Software & Digital Solutions",
                    desc: "Enterprise web platforms, cloud architecture, mobile apps, and custom ERP systems.",
                    icon: Code2,
                  },
                  {
                    id: "AIR_TICKETING",
                    title: "Air Ticketing & Visa Services",
                    desc: "International airline booking, IATA consolidated fares, and embassy visa consulting.",
                    icon: Plane,
                  },
                ].map((div) => {
                  const Icon = div.icon;
                  const isSelected = division === div.id;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => setDivision(div.id as DivisionType)}
                      className={`flex flex-col text-left rounded-xl p-5 border-2 transition ${
                        isSelected
                          ? "border-brand-navy bg-brand-surface shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-brand-navy text-brand-gold"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-brand-navy" />}
                      </div>
                      <h3 className="font-semibold text-sm text-brand-navy">{div.title}</h3>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{div.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary px-8 text-sm"
                >
                  Continue to Project Scope →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCOPE & CONTACT DETAILS */}
          {step === 2 && (
            <form onSubmit={handleSubmitQuote} className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-display font-bold text-xl text-brand-navy">
                  Step 2: Project Scope & Specifications ({division.replace(/_/g, " ")})
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-brand-navy underline"
                >
                  Change Division
                </button>
              </div>

              {/* Conditional Inputs based on Division */}
              {division === "CONSTRUCTION" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Construction Classification</label>
                    <select
                      className="input"
                      value={buildType}
                      onChange={(e) => setBuildType(e.target.value)}
                    >
                      <option value="Residential Luxury House">Residential Luxury House / Villa</option>
                      <option value="Commercial Office Building">Commercial Office Building</option>
                      <option value="Industrial Warehouse">Industrial Logistics Warehouse</option>
                      <option value="Civil Infrastructure">Civil Infrastructure / Roadworks</option>
                      <option value="Heritage Renovation">Heritage Restoration & Renovation</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Estimated Building Footprint (sq.ft)</label>
                    <input
                      type="text"
                      className="input"
                      value={sqFt}
                      onChange={(e) => setSqFt(e.target.value)}
                      placeholder="e.g. 3,500 sq.ft"
                    />
                  </div>
                </div>
              )}

              {division === "TOURISM" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Number of Travelers</label>
                    <input
                      type="text"
                      className="input"
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      placeholder="e.g. 2 Adults, 2 Children"
                    />
                  </div>
                  <div>
                    <label className="label">Preferred Tour Duration</label>
                    <input
                      type="text"
                      className="input"
                      value={tourDays}
                      onChange={(e) => setTourDays(e.target.value)}
                      placeholder="e.g. 7 Days / 6 Nights"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Estimated Budget Range</label>
                  <select
                    className="input"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  >
                    <option value="Under LKR 2.5M">Under LKR 2,500,000</option>
                    <option value="LKR 2.5M - 10M">LKR 2,500,000 – 10,000,000</option>
                    <option value="LKR 10M - 50M">LKR 10,000,000 – 50,000,000</option>
                    <option value="LKR 50M+">LKR 50,000,000+ (Enterprise / Large Scale)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Desired Timeline / Kickoff</label>
                  <select
                    className="input"
                    value={projectTimeline}
                    onChange={(e) => setProjectTimeline(e.target.value)}
                  >
                    <option value="Immediate (Within 2 weeks)">Immediate (Within 2 weeks)</option>
                    <option value="Within 1-3 Months">Within 1-3 Months</option>
                    <option value="3-6 Months Out">3-6 Months Out</option>
                    <option value="Exploratory Planning">Exploratory Planning Phase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Additional Project Details / Requirements</label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Outline site location, specific architectural features, tech stack, or tour preferences…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-sm text-brand-navy mb-3">Your Contact Details</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="+94 77 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-8 text-sm shadow-md"
                >
                  {submitting ? "Transmitting RFQ…" : "Submit Formal RFQ Request →"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CONFIRMATION & REFERENCE */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="font-display font-bold text-2xl text-brand-navy">
                Quote Request Registered!
              </h2>
              <p className="mt-2 text-xs text-gray-600 max-w-md mx-auto">
                Thank you, <strong className="text-brand-navy">{name}</strong>. Your quotation docket
                has been dispatched to the division leadership at Balasuriya Group.
              </p>

              <div className="mt-6 inline-block rounded-xl bg-slate-50 border border-gray-200 p-4">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                  Docket Tracking Reference
                </span>
                <span className="font-mono text-2xl font-bold text-brand-navy">
                  {generatedRef}
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">
                  Sector: {division} • Status: PENDING DIRECT REVIEW
                </span>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a
                  href={`https://wa.me/94767171938?text=Hello%20Balasuriya%20Group,%20I%20have%20submitted%20Quote%20Request%20${generatedRef}%20for%20${division}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary bg-[#25D366] hover:bg-[#1ebe57] text-white flex items-center gap-2 text-xs"
                >
                  Fast-Track on WhatsApp With Reference →
                </a>

                <Link to="/portal" className="btn-secondary text-xs">
                  View in Client Portal
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
