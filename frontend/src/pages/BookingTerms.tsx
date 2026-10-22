import { Plane, Palmtree, ShieldAlert, CheckCircle2, AlertTriangle, FileText, RefreshCw, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { contactInfo } from "../data/companyProfile";

export default function BookingTerms() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-brand-navy">Home</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">Ticketing &amp; Visa Terms</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 border border-sky-200">
            <Plane className="h-3.5 w-3.5" />
            Aviation &amp; Travel Regulations
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
            Air Ticketing, Visa Assistance &amp; Tour Booking Policy
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Governing Flight Bookings, Consular Visa Facilitation &amp; StayLanka Inbound Tour Engagements
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-900 text-xs font-bold">1</span>
              Air Ticketing &amp; Airline Tariff Rules
            </h2>
            <p>
              Balasuriya Group acts as an accredited travel management consolidator issuing airline tickets via International Air Transport Association (IATA) Global Distribution Systems (GDS).
            </p>
            <div className="space-y-2 mt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-brand-navy block mb-1">Dynamic Airfares &amp; Timelimits:</span>
                Flight quotes and provisional reservations are subject to dynamic inventory and airline fare rules. Fares are only guaranteed once ticketing is completed and payment is confirmed.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-brand-navy block mb-1">Ticket Cancellations &amp; Date Changes:</span>
                All voluntary ticket cancellations, date changes, or routing modifications are strictly governed by the specific airline's tariff conditions (e.g. non-refundable promo fares vs flexible corporate tickets). Airline penalty fees and administrative reissue charges apply.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-brand-navy block mb-1">Schedule Changes &amp; Flight Disruptions:</span>
                Airlines retain the operational right to reschedule, delay, or cancel flights. In the event of an involuntary schedule modification, our 24/7 Global Air Ticketing Desk assists travelers with airline re-accommodation or processing official carrier refunds.
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-900 text-xs font-bold">2</span>
              Consular Visa Facilitation &amp; Legal Disclaimers
            </h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                CRITICAL NOTICE ON VISA APPROVALS
              </div>
              <p>
                Balasuriya Group provides administrative visa documentation review, itinerary consolidation, biometric appointment scheduling, and submission facilitation. <strong>The granting, duration, or refusal of any visa is the sole sovereign prerogative of the respective embassy, consulate, or immigration department.</strong>
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Non-Refundable Embassy &amp; Facilitation Fees:</strong> Official embassy consular application fees, biometric charges, and our professional visa documentation handling fees are strictly non-refundable regardless of whether an application is granted, delayed, or refused.</li>
              <li><strong>Authenticity of Information:</strong> The applicant bears sole legal responsibility for ensuring that all supporting documents (financial statements, employment letters, tax records) submitted for visa processing are authentic, accurate, and valid.</li>
              <li><strong>Processing Timelines:</strong> Embassy processing durations published on our portals represent typical estimates provided by diplomatic missions and can vary during peak periods without notice.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-900 text-xs font-bold">3</span>
              StayLanka Inbound &amp; Outbound Tour Packages
            </h2>
            <p>
              Tour packages, bespoke holiday itineraries, luxury chauffeur services, and hotel reservations arranged by StayLanka Tours are governed by the following standard settlement and cancellation schedules:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-brand-navy font-bold">
                  <tr>
                    <th className="p-3 border-b">Notice Period Prior to Arrival</th>
                    <th className="p-3 border-b">Standard Cancellation Fee (% of Total Tour Cost)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-600">
                  <tr>
                    <td className="p-3 font-medium">30 days or more prior to arrival</td>
                    <td className="p-3 text-emerald-700 font-semibold">10% administrative fee (balance refunded)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">15 to 29 days prior to arrival</td>
                    <td className="p-3 text-amber-700 font-semibold">30% cancellation fee</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">7 to 14 days prior to arrival</td>
                    <td className="p-3 text-orange-700 font-semibold">60% cancellation fee</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Less than 7 days or No-Show</td>
                    <td className="p-3 text-rose-700 font-semibold">100% cancellation fee (strictly non-refundable)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 italic">
              * Note: Peak season hotel supplements (December 15 – January 15 and July – August) may carry non-refundable hotel deposit requirements enforced by individual luxury resorts.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="font-display text-xl font-bold text-brand-navy flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-900 text-xs font-bold">4</span>
              Travel Insurance &amp; Health Requirements
            </h2>
            <p>
              Balasuriya Group strongly advises all international travelers to procure comprehensive international travel insurance covering medical emergencies, trip cancellations, luggage loss, and emergency medical repatriation.
            </p>
            <p>
              Travelers are responsible for verifying mandatory vaccination, passport validity (minimum 6 months from arrival date), and transit visa requirements for all stopover points along their flight routing.
            </p>
          </section>

          {/* Section 5 */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="font-display text-base font-bold text-brand-navy mb-2">24/7 Ticketing &amp; Travel Assistance Desk</h3>
            <p className="text-xs text-gray-600 mb-3">
              For emergency ticket changes, flight rebooking, or tour itinerary modifications, reach our global desk at:
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5 text-xs text-gray-600">
              <div className="font-semibold text-brand-navy">Balasuriya Air Ticketing &amp; Visa Desk</div>
              <div>Head of Ticketing Desk: Mr. Shenal Fernando (<a href="mailto:shenal@balasuriyagroup.tech" className="text-blue-700 hover:underline">shenal@balasuriyagroup.tech</a>)</div>
              <div>Direct Ticketing Hotline: {contactInfo.phone}</div>
              <div>WhatsApp Support: <a href={contactInfo.whatsapp} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold hover:underline">Connect on WhatsApp</a></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
