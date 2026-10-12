import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  HardHat,
  MapPin,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Reveal } from "../../components/Reveal";
import { CountUp } from "../../components/CountUp";
import { companyStats } from "../../data/companyProfile";
import type { ConstructionProject } from "../../types";

const stats = [
  { label: "Years of Service", value: companyStats.yearsExperience, suffix: "+" },
  { label: "Projects Completed", value: companyStats.projectsDone, suffix: "+" },
  { label: "Active Sites Today", value: 4, suffix: "" },
  { label: "Safety Rating", value: 100, suffix: "%" },
];

const CATEGORIES = ["ALL", "Residential", "Commercial", "Infrastructure", "Industrial", "Renovation"];

const FALLBACK_PROJECTS: ConstructionProject[] = [
  {
    id: "proj_cinnamon",
    name: "Cinnamon Heights Residences",
    description: "A 12-storey luxury residential apartment complex with 64 units, underground parking, and rooftop infinity garden.",
    location: "Colombo 05, Sri Lanka",
    projectType: "Residential",
    coverImageUrl: "/images/projects/residential.svg",
    featured: true,
    status: "IN_PROGRESS",
    startDate: "2025-06-01",
    targetEndDate: "2027-01-30",
    progressUpdates: [
      {
        id: "up_1",
        projectId: "proj_cinnamon",
        currentStatus: "Structural framing complete up to 9th floor. Interior partitioning underway from floor 3.",
        nextPeriodPlan: "Complete framing to roof slab and commence façade glazing on lower levels.",
        percentComplete: 62,
        photoUrls: [],
        createdAt: "2026-10-01",
      },
    ],
  },
  {
    id: "proj_horizon",
    name: "Horizon Business Tower",
    description: "A 20-storey Grade-A commercial office tower with ground-floor banking hall and five-level car park.",
    location: "Colombo 02, Sri Lanka",
    projectType: "Commercial",
    coverImageUrl: "/images/projects/commercial.svg",
    featured: true,
    status: "IN_PROGRESS",
    startDate: "2025-08-10",
    targetEndDate: "2027-06-15",
    progressUpdates: [
      {
        id: "up_2",
        projectId: "proj_horizon",
        currentStatus: "Basement excavation and diaphragm shoring complete; core wall slipform in progress.",
        nextPeriodPlan: "Continue core wall concrete pours and begin ground-floor slab formwork.",
        percentComplete: 40,
        photoUrls: [],
        createdAt: "2026-09-25",
      },
    ],
  },
  {
    id: "proj_highway",
    name: "Kandy–Mahiyangana Highway Extension",
    description: "An 18km two-lane highway extension including a new river crossing pre-stressed bridge.",
    location: "Central Province, Sri Lanka",
    projectType: "Infrastructure",
    coverImageUrl: "/images/projects/infrastructure.svg",
    featured: true,
    status: "IN_PROGRESS",
    startDate: "2024-11-01",
    targetEndDate: "2026-12-10",
    progressUpdates: [
      {
        id: "up_3",
        projectId: "proj_highway",
        currentStatus: "Road base and sub-base complete for 14km. Bridge piers cast and deck launching in progress.",
        nextPeriodPlan: "Complete bridge deck, then begin wearing course asphalt surfacing.",
        percentComplete: 78,
        photoUrls: [],
        createdAt: "2026-09-28",
      },
    ],
  },
  {
    id: "proj_galle",
    name: "Galle Fort Boutique Hotel Renovation",
    description: "Heritage-sensitive colonial-era restoration into a 14-key luxury boutique hotel preserving Dutch masonry.",
    location: "Galle Fort UNESCO Zone, Sri Lanka",
    projectType: "Renovation",
    coverImageUrl: "/images/projects/renovation.svg",
    featured: true,
    status: "COMPLETED",
    startDate: "2025-01-15",
    targetEndDate: "2026-04-10",
    progressUpdates: [
      {
        id: "up_4",
        projectId: "proj_galle",
        currentStatus: "Restoration 100% complete. Original timber arches and façade preserved and handed over.",
        nextPeriodPlan: "Commissioning complete; operational for hotel guests.",
        percentComplete: 100,
        photoUrls: [],
        createdAt: "2026-04-10",
      },
    ],
  },
  {
    id: "proj_warehouse",
    name: "Seeduwa Logistics Hub & Warehouse",
    description: "A 6,000 sqm steel portal frame logistics warehouse with high-bay racking near BIA Airport.",
    location: "Seeduwa / Katunayake, Sri Lanka",
    projectType: "Industrial",
    coverImageUrl: "/images/projects/industrial-blueprint.svg",
    featured: true,
    status: "PLANNING",
    startDate: "2026-11-01",
    targetEndDate: "2027-08-30",
    progressUpdates: [
      {
        id: "up_5",
        projectId: "proj_warehouse",
        currentStatus: "Architectural drawings and environmental clearance secured. Foundation contractor appointed.",
        nextPeriodPlan: "Mobilize site machinery and begin earth leveling.",
        percentComplete: 12,
        photoUrls: [],
        createdAt: "2026-10-02",
      },
    ],
  },
];

export default function ConstructionPublic() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ projects: ConstructionProject[] }>("/api/construction/projects", { params: { featured: true } })
      .then((res) => {
        if (res.data.projects && res.data.projects.length > 0) {
          setProjects(res.data.projects);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      })
      .catch(() => {
        setProjects(FALLBACK_PROJECTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filter === "ALL") return true;
    return p.projectType?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div>
      {/* Video hero */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-brand-navy text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/construction-hero.mp4"
          poster="/videos/construction-hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-brand-navy/50" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-navy to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-gold ring-1 ring-brand-gold/40"
          >
            <Building2 className="h-4 w-4" />
            Balasuriya Construction & Infrastructure
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold [text-shadow:0_4px_24px_rgba(0,0,0,0.55)] sm:text-5xl"
          >
            Engineering Landmark Structures Across Sri Lanka
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)] text-base sm:text-lg"
          >
            From high-rise residential complexes and Grade-A commercial towers to highways and industrial
            hubs — engineered to CIDA / ICTAD standards with full transparency.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 shadow-sm border-b border-gray-100">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-brand-navy">
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Selected projects with Filter */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">Portfolio</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">Selected Projects & Progress</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Track real site milestones, bar charts, and engineering progress logs across our current work.
          </p>
        </Reveal>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === cat
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-accent/40"
              }`}
            >
              {cat === "ALL" ? "All Sectors" : cat}
            </button>
          ))}
        </div>

        {loading && <p className="mt-10 text-center text-gray-500">Loading projects…</p>}

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p, i) => {
            const latest = p.progressUpdates[0];
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link
                  to={`/construction/${p.id}`}
                  className="card group block h-full overflow-hidden p-0 transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-brand-navy">
                    {p.coverImageUrl ? (
                      <img
                        src={p.coverImageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-navy text-white/40">
                        <Building2 className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {p.projectType && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-navy shadow">
                        {p.projectType}
                      </span>
                    )}
                    <span className="absolute right-3 top-3">
                      <StatusBadge status={p.status} />
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-brand-navy text-base group-hover:text-brand-steel transition">
                      {p.name}
                    </h3>
                    {p.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" /> {p.location}
                      </p>
                    )}
                    {p.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-600 leading-relaxed">{p.description}</p>
                    )}

                    {latest && (
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3 text-brand-steel" /> Completion
                          </span>
                          <span className="font-bold text-brand-navy">{latest.percentComplete}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${latest.percentComplete}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-gold"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                          <span className="line-clamp-1">Current: {latest.currentStatus}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Safety & Compliance Bar */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold text-brand-navy font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base">CIDA & Regulatory Standards Adherence</h4>
              <p className="text-xs text-white/70">
                Rigorous structural quality assurance, ISO certified materials, and OSHA-compliant site safety.
              </p>
            </div>
          </div>

          <Link to="/quote" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2.5 px-6 whitespace-nowrap">
            Request Construction RFQ →
          </Link>
        </div>
      </section>

      {/* Callout */}
      <section className="bg-brand-surface py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
            <HardHat className="h-6 w-6 text-brand-navy" />
          </span>
          <h3 className="font-display text-2xl font-bold text-brand-navy">Planning a Construction Project?</h3>
          <p className="max-w-md text-sm text-gray-600">
            From preliminary architectural consultation to turnkey handover, speak directly with our engineering division leaders.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/quote" className="btn-primary text-xs py-2.5 px-6">
              Calculate Project Quote
            </Link>
            <Link to="/contact" className="btn-secondary text-xs py-2.5 px-6">
              Contact Engineering Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
