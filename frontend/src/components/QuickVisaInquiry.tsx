import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Globe,
  Mail,
  MapPin,
  Plane,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { contactInfo } from "../data/companyProfile";
import toast from "react-hot-toast";

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const POPULAR_COUNTRIES = [
  "India",
  "Malaysia",
  "Indonesia (Bali)",
  "Vietnam",
  "Cambodia",
  "Laos",
  "China",
  "Maldives",
  "United Arab Emirates (Dubai)",
  "Singapore",
  "United Kingdom (UK)",
  "Schengen Area (Europe)",
  "Australia & New Zealand",
  "United States (USA)",
  "Canada",
  "Japan & South Korea",
  "Other Destination",
];

interface QuickVisaInquiryProps {
  initialCountry?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export default function QuickVisaInquiry({
  initialCountry = "India",
  compact = false,
}: QuickVisaInquiryProps) {
  const [country, setCountry] = useState(initialCountry);
  const [category, setCategory] = useState<"TOURIST" | "BUSINESS" | "TRANSIT" | "STUDENT">("TOURIST");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [stayDuration, setStayDuration] = useState("14 Days");
  const [notes, setNotes] = useState("");

  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  function generateSummaryText() {
    return [
      `*BALASURIYA GROUP — ONLINE VISA APPLICATION*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🌍 *Destination Country:* ${country}`,
      `📋 *Visa Category:* ${category === "TOURIST" ? "Tourist / Holiday Visa" : category === "BUSINESS" ? "Business / Corporate Visa" : category + " Visa"}`,
      `👤 *Applicant Name:* ${fullName}`,
      `📱 *Phone / WhatsApp:* ${phone || "Not specified"}`,
      `✉️ *Email Address:* ${email}`,
      `🛂 *Passport Number:* ${passportNumber || "Will provide later"}`,
      `📅 *Intended Travel Date:* ${travelDate || "Flexible / Not finalized"}`,
      `⏱️ *Estimated Duration:* ${stayDuration}`,
      notes ? `📝 *Notes / Requirements:* ${notes}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Sent to Balasuriya Group Visa Bureau (Official Mail: ${contactInfo.email})_`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handleSendWhatsApp() {
    if (!fullName.trim()) {
      toast.error("Please enter applicant name before sending.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      toast.error("Please provide at least a phone number or email address.");
      return;
    }

    const text = encodeURIComponent(generateSummaryText());
    window.open(`${contactInfo.whatsapp}?text=${text}`, "_blank");
    toast.success("Opening WhatsApp with your visa application details!");
  }

  async function handleSendEmail(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter your name and email address.");
      return;
    }

    setSubmittingEmail(true);
    try {
      const summaryText = generateSummaryText();
      const res = await api.post<{ success: boolean; referenceId: string; message: string }>("/api/inquiries", {
        division: "VISA",
        name: fullName,
        email,
        phone,
        subject: `Visa Inquiry (${country} - ${category}): ${fullName}`,
        message: summaryText,
        details: {
          destinationCountry: country,
          visaCategory: category,
          passportNumber: passportNumber || "Pending",
          intendedTravelDate: travelDate || "Flexible",
          stayDuration,
          applicantNotes: notes,
        },
      });

      const ref = res.data?.referenceId || `BG-VISA-INQ-${Date.now().toString().slice(-6)}`;
      setSubmittedRef(ref);
      toast.success("Visa application emailed to balasuriyagroup.info@gmail.com!");
    } catch (err) {
      // Fallback: Mailto link with applicant email CC'd
      const subject = encodeURIComponent(`Online Visa Application: ${country} (${fullName})`);
      const body = encodeURIComponent(
        `APPLICANT EMAIL: ${email}\n` +
        `APPLICANT PHONE: ${phone || "Not specified"}\n\n` +
        generateSummaryText()
      );
      window.location.href = `mailto:${contactInfo.email}?cc=${encodeURIComponent(email)}&subject=${subject}&body=${body}`;
      toast.success("Opening your email client to dispatch to balasuriyagroup.info@gmail.com");
    } finally {
      setSubmittingEmail(false);
    }
  }

  function handleSendDirectMailApp() {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter your name and email address.");
      return;
    }
    const subject = encodeURIComponent(`Direct Visa Application: ${country} (${fullName})`);
    const body = encodeURIComponent(
      `APPLICANT EMAIL: ${email}\n` +
      `APPLICANT PHONE: ${phone || "Not specified"}\n\n` +
      generateSummaryText()
    );
    window.location.href = `mailto:${contactInfo.email}?cc=${encodeURIComponent(email)}&subject=${subject}&body=${body}`;
    toast.success("Opening your email client with your email address added!");
  }

  return (
    <div className={`rounded-2xl border border-brand-gold/30 bg-white p-6 shadow-xl ${compact ? "" : "sm:p-8"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm ring-1 ring-brand-gold/40">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-brand-navy sm:text-xl">
              Express Visa Inquiry Desk
            </h3>
            <p className="text-xs text-gray-500">
              Submit your basic details & send directly via <strong>WhatsApp</strong> or <strong>Official Mail</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Mail: {contactInfo.email}
        </div>
      </div>

      {submittedRef ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-display text-xl font-bold text-emerald-950">
              Visa Details Successfully Dispatched!
            </h4>
            <p className="mt-1 text-xs text-emerald-800">
              Your inquiry has been emailed to <strong>balasuriyagroup.info@gmail.com</strong>.
            </p>
            <div className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-xs font-mono font-bold text-brand-navy shadow-sm border border-emerald-200">
              Reference: #{submittedRef}
            </div>
          </div>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Our visa officers will review your destination requirements for {country} and get in touch with you promptly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1ebe57] transition shadow"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d={WHATSAPP_ICON_PATH} />
              </svg>
              Also Send via WhatsApp
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setFullName("");
                setPassportNumber("");
                setNotes("");
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Country */}
            <div>
              <label className="label">Destination Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input"
              >
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="label">Visa Purpose / Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="input font-semibold text-brand-navy"
              >
                <option value="TOURIST">Tourist / Holiday Visa (eVisa)</option>
                <option value="BUSINESS">Business / Corporate Visa</option>
                <option value="TRANSIT">Transit Visa (Stopover)</option>
                <option value="STUDENT">Student / Short Course Visa</option>
              </select>
            </div>

            {/* Applicant Name */}
            <div>
              <label className="label">Applicant Full Name *</label>
              <input
                type="text"
                required
                placeholder="As written on passport"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            {/* Passport */}
            <div>
              <label className="label">Passport Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. N1234567"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                className="input uppercase"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="label">Approximate Travel Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="input"
              />
            </div>

            {/* Stay Duration */}
            <div>
              <label className="label">Estimated Stay Duration</label>
              <select
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                className="input"
              >
                <option value="7-14 Days">7 – 14 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
                <option value="Multiple Entry / Long Stay">Multiple Entry / Long Stay</option>
              </select>
            </div>

            {/* Specific notes */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label">Special Notes / Requirements</label>
              <input
                type="text"
                placeholder="e.g. Family of 4, urgent processing"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Action Buttons: WhatsApp and Email */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Option 1: WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold text-white hover:bg-[#1ebe57] transition shadow-md w-full sm:w-auto"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={WHATSAPP_ICON_PATH} />
                </svg>
                Send via WhatsApp (+94 76 7171 938)
              </button>

              {/* Option 2: Email to Official Mail */}
              <button
                type="submit"
                disabled={submittingEmail}
                className="btn-primary bg-brand-navy hover:bg-brand-steel text-white px-5 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
              >
                <Mail className="h-4 w-4 text-brand-gold" />
                {submittingEmail ? "Dispatching..." : "Send to Official Mail"}
              </button>

              {/* Option 3: Direct Email App */}
              <button
                type="button"
                onClick={handleSendDirectMailApp}
                className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition w-full sm:w-auto"
                title="Open directly in Gmail / Outlook / Mail App with your email CC'd"
              >
                <Send className="h-3.5 w-3.5 text-brand-accent" />
                Direct Mail (From My Email)
              </button>
            </div>

            <span className="text-[11px] text-gray-500 text-center sm:text-right">
              Official Bureau: <strong>balasuriyagroup.info@gmail.com</strong>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
