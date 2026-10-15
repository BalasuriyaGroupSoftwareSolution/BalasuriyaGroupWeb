import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  FileCheck,
  FileText,
  Globe,
  MapPin,
  Palmtree,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal } from "../components/Reveal";
import { contactInfo } from "../data/companyProfile";
import { api } from "../lib/api";
import QuickVisaInquiry from "../components/QuickVisaInquiry";
import toast from "react-hot-toast";

const POPULAR_DESTINATIONS = [
  { country: "United Kingdom & Europe", flag: "🇬🇧 🇪🇺", processing: "15-20 Days", type: "Tourist & Business Visas" },
  { country: "Australia & New Zealand", flag: "🇦🇺 🇳🇿", processing: "20-25 Days", type: "Visitor & Subclass 600" },
  { country: "United Arab Emirates (Dubai)", flag: "🇦🇪", processing: "48-72 Hours", type: "30 & 60-Day Express eVisa" },
  { country: "Singapore & Malaysia", flag: "🇸🇬 🇲🇾", processing: "3-5 Working Days", type: "E-Pass & Tourist eVisa" },
  { country: "Canada & North America", flag: "🇨🇦 🇺🇸", processing: "B1/B2 & Temporary Resident", type: "Interview Scheduling & Documentation" },
  { country: "Japan & South Korea", flag: "🇯🇵 🇰🇷", processing: "7-10 Days", type: "Official Embassy Submissions" },
];

export default function AirTicketingPublic() {
  const [tripType, setTripType] = useState<"round" | "oneway">("round");
  const [fromCity, setFromCity] = useState("Colombo (CMB)");
  const [toCity, setToCity] = useState("London (LHR)");
  const [departDate, setDepartDate] = useState("2026-11-15");
  const [returnDate, setReturnDate] = useState("2026-11-30");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleFlightInquiry(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/inquiries", {
        division: "AIR_TICKETING",
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        subject: `Air Ticket Inquiry: ${fromCity} -> ${toCity}`,
        message: `Trip Type: ${tripType.toUpperCase()} | Class: ${cabinClass} | Passengers: ${passengers} | Depart: ${departDate} ${tripType === "round" ? "| Return: " + returnDate : ""}`,
        details: {
          fromCity,
          toCity,
          departDate,
          returnDate: tripType === "round" ? returnDate : null,
          passengers,
          cabinClass,
        },
      });
      toast.success("Flight inquiry sent! Mr. Clavo Balasuriya and the ticketing team will reach out with fares.");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    } catch (err) {
      toast.success("Flight inquiry noted! We will contact you shortly.");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-brand-steel to-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Official Division Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-6 flex flex-col items-center"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-white p-1.5 shadow-2xl ring-4 ring-brand-gold/40">
              <img
                src="/images/foreign-tours-air-tickets-visa.jpg"
                alt="Balasuriya Group - Foreign Tours, Air Ticket Booking & Visa"
                className="h-full w-full object-cover rounded-2xl"
              />
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-gold ring-1 ring-brand-gold/40">
              <Plane className="h-3.5 w-3.5" />
              FOREIGN TOURS • AIR TICKET BOOKING • VISA
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Air Ticket Booking & Online Visa Processing Bureau
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/85 text-base sm:text-lg"
          >
            Specialized flight booking across 150+ airlines, fast-track online visas for 
            Tourist & Business travellers, and dedicated applicant revision windows before embassy lodgement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/portal?tab=visas"
              className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 px-6 py-3 font-bold shadow-xl flex items-center gap-2"
            >
              <Globe className="h-4 w-4" /> Apply for Visa Online
            </Link>
            <a
              href="#flight-form"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition flex items-center gap-2"
            >
              <Plane className="h-4 w-4" /> Request Flight Fares
            </a>
          </motion.div>
        </div>
      </section>

      {/* Flight Search & Quote Form */}
      <div id="flight-form" className="mx-auto -mt-10 max-w-5xl px-4 relative z-10">
        <div className="card p-6 sm:p-8 shadow-2xl ring-1 ring-black/5 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTripType("round")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tripType === "round"
                    ? "bg-brand-navy text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => setTripType("oneway")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tripType === "oneway"
                    ? "bg-brand-navy text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                One Way
              </button>
            </div>

            <div className="text-xs text-gray-500 hidden sm:block">
              Lead Officer: <strong className="text-brand-navy">Mr. Clavo Balasuriya</strong>
            </div>
          </div>

          <form onSubmit={handleFlightInquiry} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label">Origin City / Airport</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Destination City</label>
                <div className="relative">
                  <Plane className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Departure Date</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {tripType === "round" && (
                <div>
                  <label className="label">Return Date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label">Passengers</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Cabin Class</label>
                <select
                  className="input"
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                >
                  <option value="ECONOMY">Economy Class</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business Class</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              <div>
                <label className="label">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">WhatsApp / Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+94 77 000 0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <span className="text-xs text-gray-400">
                Direct IATA airline rates negotiated with SriLankan, Emirates, Qatar Airways & Singapore Airlines.
              </span>
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto py-2.5 px-8">
                {submitting ? "Searching Fares…" : "Find Best Flight Quotes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Online Visa Processing Bureau Feature */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-brand-navy to-slate-900 p-8 sm:p-12 text-white shadow-2xl border border-brand-gold/30">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-gold/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3.5 py-1 text-xs font-bold text-brand-gold ring-1 ring-brand-gold/40 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> High-Standard Online Visa Bureau
              </div>

              <h2 className="font-display text-3xl font-bold sm:text-4xl text-white">
                Apply for Tourist & Business Visas 100% Online
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Log into your Balasuriya Group account and apply for international visas from the comfort of your home or office.
                Our automated pipeline allows you to submit your itinerary, passport details, hotel reservations, or corporate sponsor documentation with complete security.
              </p>

              {/* Unique Value Propositions */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-brand-gold font-semibold text-sm">
                    <Globe className="h-4 w-4" /> Tourist & Holiday Visas
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300">
                    Fast eVisas and consular processing for Dubai, UK, Schengen, Singapore, Malaysia, and beyond.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-brand-gold font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" /> Business & Corporate Visas
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300">
                    B1/B2, delegation visits, trade expos, sponsor invitations, and multi-entry business clearances.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 backdrop-blur-sm sm:col-span-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                    <Edit3 className="h-4 w-4" /> Built-in Applicant Revision Window
                  </div>
                  <p className="mt-1.5 text-xs text-slate-200">
                    Applied already? You have a <strong>dedicated edit window</strong> before embassy lodgement to update your passport details, change hotel stays, or attach revised invitation letters directly from your portal.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/portal?tab=visas"
                  className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 px-6 py-3 font-bold shadow-xl flex items-center gap-2 text-sm"
                >
                  <Globe className="h-4 w-4" /> Enter Customer Visa Portal <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login?redirect=/portal%3Ftab%3Dvisas"
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Client Sign In
                </Link>
              </div>
            </div>

            {/* Visual Preview / Slip showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-brand-navy shadow-2xl ring-1 ring-black/10">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/foreign-tours-air-tickets-visa.jpg"
                      alt="Logo"
                      className="h-9 w-9 rounded-lg object-cover ring-1 ring-brand-navy/10"
                    />
                    <div>
                      <span className="block text-[11px] font-bold text-brand-navy leading-none">BALASURIYA GROUP</span>
                      <span className="text-[9px] text-gray-500">Official Visa Bureau</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    LIVE SYSTEM
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center rounded-xl bg-slate-50 p-2.5">
                    <span className="text-gray-500">Sample Reference:</span>
                    <strong className="font-mono text-brand-navy">BG-VISA-2026-8941</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Target Category:</span>
                    <span className="font-semibold text-brand-navy">TOURIST (Dubai 60-Day)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Applicant Revision:</span>
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                      Editable (48h Remaining)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Digital Slip:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" /> Printable with Seal
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                  <Link
                    to="/portal?tab=visas"
                    className="block w-full rounded-xl bg-brand-navy py-2 text-xs font-bold text-white hover:bg-brand-steel transition"
                  >
                    Start Your Application Online →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Express Visa Inquiry Desk with WhatsApp & Email Dispatch */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <QuickVisaInquiry />
      </section>

      {/* Worldwide Visa Assistance Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Immigration & Travel Docs
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
            Comprehensive Visa Consultation
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Our visa division assists Sri Lankan and international citizens with meticulous document preparation,
            financial drafting, and embassy appointment scheduling.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_DESTINATIONS.map((dest, i) => (
            <Reveal key={dest.country} delay={i * 0.08}>
              <div className="card h-full flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{dest.flag}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                      {dest.processing}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display font-bold text-lg text-brand-navy">{dest.country}</h3>
                  <p className="mt-1 text-xs text-gray-500">{dest.type}</p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-3">
                  <a
                    href={`https://wa.me/94767171938?text=Hello%20Balasuriya%20Group,%20I%20need%20visa%20consultation%20for%20${encodeURIComponent(
                      dest.country
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Consult on WhatsApp →
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact Hotline Banner */}
      <section className="bg-brand-surface py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-navy">Need Urgent Flight Assistance?</h3>
          <p className="mt-2 text-sm text-gray-600">
            Our ticketing desk is on standby for emergency date changes, re-issues, and group bookings.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="btn-primary flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call Direct: {contactInfo.phone}
            </a>
            <a
              href="https://wa.me/94767171938?text=Hello%20Balasuriya%20Air%20Ticketing%20Team"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
