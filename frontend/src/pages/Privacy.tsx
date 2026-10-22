import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "../data/companyProfile";

export default function Privacy() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-brand-navy">Home</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">Privacy Policy</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Compliance &amp; Data Protection
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
            Balasuriya Group Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Last Updated &amp; Effective: January 2026 &bull; Compliant with Sri Lanka Personal Data Protection Act No. 9 of 2022 (PDPA)
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">1</span>
              Corporate Commitment &amp; Scope
            </h2>
            <p>
              Balasuriya Group (Pvt) Ltd ("Balasuriya Group", "we", "our", or "the Group") operates as a diversified conglomerate encompassing civil engineering and infrastructure, travel and tourism (StayLanka Tours), air ticketing and consular visa facilitation, and enterprise software engineering.
            </p>
            <p>
              We are strictly committed to safeguarding the confidentiality, integrity, and privacy of all personal and corporate information entrusted to us by clients, corporate partners, travelers, contractors, and employees in accordance with Sri Lanka’s Personal Data Protection Act (PDPA) No. 09 of 2022 and applicable international data privacy standards.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">2</span>
              Information We Collect
            </h2>
            <p>
              Depending on the division and commercial service you engage with, we may collect and process the following categories of data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Contact &amp; Identification Data:</strong> Full legal names, national identity card (NIC) numbers, passport bio-data pages, corporate designations, physical addresses, telephone numbers, and email addresses.</li>
              <li><strong>Travel &amp; Consular Visa Information:</strong> Passport expiration dates, flight itineraries, transit requirements, travel companion details, emergency contact information, and embassy submission documents.</li>
              <li><strong>Commercial &amp; Project Specifications:</strong> Architectural site blueprints, BOQ requirements, construction survey measurements, and software technical specifications.</li>
              <li><strong>Financial &amp; Settlement Records:</strong> Bank transaction deposit slips, corporate check reference numbers, wire transfer receipts, and billing invoices. Note: We do not store sensitive payment card CVV numbers directly on our servers.</li>
              <li><strong>System Authentication Data:</strong> User account credentials, encrypted password hashes, and access audit logs for our Client Portal and Staff Governance Platform.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">3</span>
              Purpose &amp; Lawful Basis of Processing
            </h2>
            <p>
              We process personal data strictly where permitted by applicable statutory grounds:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">Contractual Performance</span>
                <p className="text-xs text-gray-600">Fulfilling construction milestones, issuing flight tickets via airline GDS systems, securing hotel allotments, and deploying software projects.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">Legal &amp; Regulatory Compliance</span>
                <p className="text-xs text-gray-600">Complying with CIDA statutory regulations, IATA ticketing protocols, civil aviation requirements, and Sri Lanka Inland Revenue fiscal mandates.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">Security &amp; Fraud Prevention</span>
                <p className="text-xs text-gray-600">Verifying bank deposit slips against fraudulent submissions and preventing unauthorized portal credential access.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">Client Communications</span>
                <p className="text-xs text-gray-600">Dispatching booking confirmations, flight schedule change alerts, project milestone logs, and password reset authorizations.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">4</span>
              Third-Party Data Disclosures &amp; Disclaimers
            </h2>
            <p>
              Balasuriya Group does <strong>never sell, rent, or trade</strong> your personal information to marketing brokers. Disclosures occur solely where indispensable to deliver requested services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Airlines &amp; Global Distribution Systems (GDS):</strong> Transmitting traveler passenger name records (PNRs) to airlines (e.g., SriLankan Airlines, Emirates, Qatar Airways) for ticket issuance.</li>
              <li><strong>Embassies &amp; Consular Services:</strong> Submitting official visa documentation strictly pursuant to your express instructions.</li>
              <li><strong>Governmental Authorities:</strong> When formally subpoenaed or required by law enforcement or competent judicial bodies under Sri Lankan jurisdiction.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">5</span>
              Data Security Standards &amp; Storage
            </h2>
            <p>
              We implement industry-grade technical and organizational safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Transport Layer Security:</strong> All web traffic and portal communications are enforced over 256-bit TLS/SSL encryption.</li>
              <li><strong>Cryptographic Hashing:</strong> User passwords and authentication credentials are salted and hashed using PBKDF2/SHA-512.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Multi-tier staff authorization ensures employees access only data pertinent to their specific operational division.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">6</span>
              Your Statutory Rights
            </h2>
            <p>
              Under Sri Lanka PDPA and relevant privacy legislation, you have the right to request access to your personal data held by us, request correction of inaccurate data, withdraw processing consent, or request erasure subject to statutory retention obligations (e.g. tax records).
            </p>
            <p>
              To exercise any of these rights, please contact our Data Governance Officer at:
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="font-semibold text-brand-navy">Balasuriya Group Corporate Data Protection Officer</div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-brand-navy" />
                <a href={`mailto:${contactInfo.email}`} className="text-blue-700 hover:underline">{contactInfo.email}</a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-brand-navy" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-brand-navy shrink-0 mt-0.5" />
                <span>{contactInfo.address}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
