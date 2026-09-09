import { contactInfo } from "../data/companyProfile";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-brand-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-bold">Balasuriya Group</h3>
          <p className="mt-2 text-sm text-white/70">
            Construction and Tourism, built on trust. Serving Sri Lanka and beyond.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">Divisions</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>Construction</li>
            <li>Tourism — Local &amp; Foreign Tours</li>
            <li>Visa Assistance &amp; Air Tickets</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">Contact</h4>
          <p className="mt-2 text-sm text-white/80">{contactInfo.address}</p>
          <p className="text-sm text-white/80">{contactInfo.phone}</p>
          <p className="text-sm text-white/80">{contactInfo.email}</p>
          <p className="text-sm text-white/80">balasuriyagroup.tech</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Balasuriya Group. All rights reserved.
      </div>
    </footer>
  );
}
