import { Link } from "react-router-dom";
import {
  Building2,
  Code2,
  FileCheck,
  Mail,
  MapPin,
  Palmtree,
  Phone,
  Plane,
  ShieldCheck,
} from "lucide-react";
import { contactInfo } from "../data/companyProfile";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-brand-navy text-white">
      {/* Top Pre-Footer Corporate Trust Bar */}
      <div className="border-b border-white/10 bg-slate-900 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 text-xs text-white/80">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-gold" />
            <span>
              <strong>Accredited Corporate Group:</strong> CIDA Certified Civil Construction • IATA Airline Consolidator • ISO Compliant
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sustainability" className="hover:text-brand-gold transition">
              ESG Framework
            </Link>
            <span className="text-white/30">•</span>
            <Link to="/portal" className="hover:text-brand-gold transition">
              Client Portal Login
            </Link>
            <span className="text-white/30">•</span>
            <Link to="/quote" className="text-brand-gold font-bold hover:underline">
              Request Project RFQ →
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: Brand & Heritage */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Balasuriya Group"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-gold/60"
            />
            <div>
              <h3 className="font-display text-lg font-bold">Balasuriya Group</h3>
              <p className="text-[10px] uppercase tracking-widest text-brand-gold">
                Building Sri Lanka's Future
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/75">
            A premier diversified Sri Lankan conglomerate delivering turnkey civil construction,
            bespoke tourism & global ticketing, and enterprise software engineering solutions.
          </p>
          <div className="mt-4 rounded-xl bg-white/5 p-3 text-[11px] text-white/70 border border-white/5">
            <span className="font-semibold text-white block">Corporate Registration:</span>
            Registered in Sri Lanka under Companies Act No. 07 of 2007.
          </div>
        </div>

        {/* Col 2: Operating Divisions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            Operating Divisions
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/80">
            <li>
              <Link to="/construction" className="flex items-center gap-2 hover:text-white transition">
                <Building2 className="h-3.5 w-3.5 text-brand-steel" />
                Construction & Infrastructure
              </Link>
            </li>
            <li>
              <Link to="/tourism" className="flex items-center gap-2 hover:text-white transition">
                <Palmtree className="h-3.5 w-3.5 text-emerald-400" />
                Tourism & Holiday Packages
              </Link>
            </li>
            <li>
              <Link to="/air-ticketing" className="flex items-center gap-2 hover:text-white transition">
                <Plane className="h-3.5 w-3.5 text-sky-400" />
                Air Ticketing & Visa Assistance
              </Link>
            </li>
            <li>
              <Link to="/software" className="flex items-center gap-2 hover:text-white transition">
                <Code2 className="h-3.5 w-3.5 text-purple-400" />
                Software & Digital Solutions
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Company & Governance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            Corporate Governance
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs text-white/80">
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us & Board of Directors
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white transition">
                Careers & Open Positions
              </Link>
            </li>
            <li>
              <Link to="/sustainability" className="hover:text-white transition">
                Sustainability & ESG Policy
              </Link>
            </li>
            <li>
              <Link to="/quote" className="hover:text-white transition">
                Instant Project Estimator (RFQ)
              </Link>
            </li>
            <li>
              <Link to="/portal" className="hover:text-white transition">
                Track Active Projects & Bookings
              </Link>
            </li>
            <li>
              <Link to="/staff" className="hover:text-white transition">
                Staff Governance Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate Contact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            Corporate Headquarters
          </h4>
          <div className="mt-4 space-y-3 text-xs text-white/80">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>{contactInfo.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
              <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {contactInfo.phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
              <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                {contactInfo.email}
              </a>
            </div>
          </div>

          <div className="mt-6">
            <a
              href={contactInfo.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1ebe57]"
            >
              Direct WhatsApp Hotline
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4">
          <p>© {new Date().getFullYear()} Balasuriya Group (Pvt) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/60">
            <Link to="/about" className="hover:text-white">Privacy Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-white">Terms of Engagement</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-white">Security Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
