import { FileCheck, Shield, Scale, AlertCircle, Building2, Palmtree, Plane, Code2, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "../data/companyProfile";

export default function Terms() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-brand-navy">Home</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">Terms of Service</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Scale className="h-3.5 w-3.5" />
            Corporate Legal Governance
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
            Terms of Service &amp; Engagement
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Last Updated &amp; Effective: January 2026 &bull; Governed under the Laws of the Democratic Socialist Republic of Sri Lanka
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">1</span>
              General Corporate Overview
            </h2>
            <p>
              Welcome to the official website and digital client portals of <strong>Balasuriya Group (Pvt) Ltd</strong>. By accessing our website (<code>www.balasuriyagroup.tech</code>), initiating project inquiries, requesting commercial quotations (RFQs), making reservations, or utilizing our Client Portal, you agree to be bound by these Terms of Service.
            </p>
            <p>
              These Terms apply across all subsidiary divisions of Balasuriya Group, including Civil Engineering &amp; Construction, StayLanka Tours, Balasuriya Air Ticketing &amp; Visa Assistance, and Software &amp; Digital Solutions.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">2</span>
              Quotations, Contracts &amp; Commercial Scope
            </h2>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">
                  1. Civil Engineering &amp; Construction Contracts
                </span>
                <p className="text-xs text-gray-600">
                  Quotations generated via our online estimator or issued by our quantity surveying team represent preliminary commercial estimates based on provided specifications. Formal construction commitments require a signed Civil Engineering Contract, standard CIDA/ICTAD general conditions, architectural approval, and agreed milestone schedules.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">
                  2. Travel &amp; Tour Packages (StayLanka Tours)
                </span>
                <p className="text-xs text-gray-600">
                  Custom itineraries, luxury chauffeur services, and inbound tour packages are confirmed upon receipt of designated deposit settlements and confirmation of third-party hotel room allotments.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">
                  3. Air Ticketing &amp; Visa Assistance
                </span>
                <p className="text-xs text-gray-600">
                  Flight fares and seat inventories are subject to dynamic airline GDS availability until ticket issuance. Visa facilitation services are subject to specific embassy statutory prerequisites as detailed in our dedicated <Link to="/booking-terms" className="text-blue-700 underline font-semibold">Ticketing &amp; Visa Booking Terms</Link>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-brand-navy block text-xs uppercase tracking-wider mb-1">
                  4. Enterprise Software Engineering
                </span>
                <p className="text-xs text-gray-600">
                  Software development deliverables are governed by explicit Statements of Work (SOW), defining sprint deliverables, user acceptance testing (UAT) periods, and intellectual property transfer terms upon final financial clearance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">3</span>
              Financial Settlements &amp; Deposit Slip Verification Policy
            </h2>
            <p>
              To maintain financial governance and combat wire fraud, Balasuriya Group enforces the following settlement policies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Direct Bank Transfers:</strong> Payments must be deposited exclusively into official, designated corporate bank accounts under the legal name <em>Balasuriya Group (Pvt) Ltd</em>. We never request deposits into personal non-corporate accounts.</li>
              <li><strong>Deposit Slip Verification:</strong> Clients uploading bank deposit slips or transfer advices through the Client Portal receive an automated provisional reference. Official receipting and milestone authorization are executed once our Treasury Approvers confirm bank clearance.</li>
              <li><strong>Invoicing:</strong> Official VAT/SSCL invoices and tax receipts are issued pursuant to the Inland Revenue Act of Sri Lanka.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">4</span>
              Intellectual Property Rights
            </h2>
            <p>
              All trademarks, group logos, architectural conceptual renderings, software source code, website designs, text, and marketing assets are the proprietary intellectual property of Balasuriya Group (Pvt) Ltd or its licensed partners, protected under the Intellectual Property Act No. 36 of 2003 of Sri Lanka.
            </p>
            <p>
              Unauthorized reproduction, web scraping, framing, or distribution of materials without prior written executive authorization is strictly prohibited.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">5</span>
              Limitation of Liability &amp; Force Majeure
            </h2>
            <p>
              Balasuriya Group shall not be held liable for failure or delay in performance resulting from events beyond our reasonable control (Force Majeure), including acts of God, extreme meteorological events, civil unrest, airline cancellations, airspace closures, or government statutory restrictions.
            </p>
            <p>
              In all cases, our aggregate liability arising out of or in connection with any commercial engagement shall be strictly limited to the actual net service fee received by Balasuriya Group for that specific deliverable.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy text-xs font-bold">6</span>
              Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms and any contractual agreements with Balasuriya Group shall be governed by, construed, and enforced in accordance with the <strong>laws of the Democratic Socialist Republic of Sri Lanka</strong>.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to commercial engagements that cannot be settled amicably within thirty (30) days shall be referred to arbitration in Colombo, Sri Lanka, in accordance with the Arbitration Act No. 11 of 1995.
            </p>
          </section>

          {/* Contact Section */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="font-display text-base font-bold text-brand-navy mb-2">Legal Enquiries &amp; Corporate Inquiries</h3>
            <p className="text-xs text-gray-600 mb-3">
              For commercial contracts, legal documentation, or questions regarding these terms, please contact:
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5 text-xs text-gray-600">
              <div className="font-semibold text-brand-navy">Balasuriya Group Corporate Secretariat</div>
              <div>Email: <a href={`mailto:${contactInfo.email}`} className="text-blue-700 hover:underline">{contactInfo.email}</a></div>
              <div>Telephone: {contactInfo.phone}</div>
              <div>Address: {contactInfo.address}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
