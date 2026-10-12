import { motion } from "framer-motion";
import { Building2, Code2, Palmtree, Plane, Quote } from "lucide-react";
import { DivisionCard } from "../components/DivisionCard";
import { Reveal } from "../components/Reveal";
import { CountUp } from "../components/CountUp";
import { companyStats, testimonials } from "../data/companyProfile";

const divisionImages = import.meta.glob<{ default: string }>(
  "../assets/divisions/*.{jpg,jpeg,png}",
  { eager: true }
);

function divisionImage(file: string) {
  const match = Object.entries(divisionImages).find(([path]) => path.endsWith(file));
  return match?.[1].default;
}

const stats = [
  { label: "Years of Service", value: companyStats.yearsExperience, suffix: "+" },
  { label: "Projects Completed", value: companyStats.projectsDone, suffix: "+" },
  { label: "Industry Sectors", value: companyStats.sectors, suffix: "" },
  { label: "Customer Satisfaction", value: companyStats.customerFocusPercent, suffix: "%" },
];

export default function Home() {
  return (
    <div>
      {/* Hero with looping background video */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-brand-navy text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero.mp4"
          poster="/videos/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-brand-navy/30" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-navy to-transparent" />

        {/* soft animated glow blobs for depth */}
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold"
          >
            Balasuriya Group
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 font-display text-4xl font-bold leading-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.55)] sm:text-6xl"
          >
            Building the Future of Sri Lanka
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
          >
            Trusted construction projects built to last, and unforgettable journeys across Sri
            Lanka shaped around you — with visa assistance and air ticket booking handled every
            step of the way.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="/construction" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
              Explore Projects
            </a>
            <a href="/tourism" className="btn-secondary border-white/40 text-white hover:bg-white/10">
              Discover Tours
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divisions */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">What we do</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">Our Divisions</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Reveal delay={0}>
            <DivisionCard
              title="Construction"
              description="Turnkey civil construction, architectural planning, and infrastructure development across Sri Lanka."
              to="/construction"
              cta="Explore projects"
              image={divisionImage("constructions.jpg")}
              icon={<Building2 className="h-5 w-5" />}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <DivisionCard
              title="StayLanka"
              description="Inbound destination management, luxury island villas, eco-retreats, and cultural heritage experiences."
              to="/tourism"
              cta="Wonder awaits"
              image={divisionImage("stay-lanka.png")}
              icon={<Palmtree className="h-5 w-5" />}
            />
          </Reveal>
          <Reveal delay={0.16}>
            <DivisionCard
              title="Foreign Tours"
              description="Curated outbound holidays, international holiday packages, and sacred pilgrimage journeys."
              to="/tourism"
              cta="Explore tours"
              image={divisionImage("foreign-tours.png")}
              icon={<Plane className="h-5 w-5" />}
            />
          </Reveal>
          <Reveal delay={0.24}>
            <DivisionCard
              title="Air Ticket Booking"
              description="IATA-aligned global flight ticketing, corporate reservations, and seamless embassy visa services."
              to="/air-ticketing"
              cta="Book flights"
              image={divisionImage("air-tickets.png")}
              icon={<Plane className="h-5 w-5" />}
            />
          </Reveal>
          <Reveal delay={0.32}>
            <DivisionCard
              title="Software & Solutions"
              description="Enterprise cloud architecture, custom web platforms, mobile apps, and business AI automation."
              to="/software"
              cta="Explore tech stack"
              image={divisionImage("software-solutions.jpg")}
              icon={<Code2 className="h-5 w-5" />}
            />
          </Reveal>
        </div>

        {/* Rapid Actions Bar */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-navy via-brand-steel to-slate-900 p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-gold font-bold">
              Instant Estimation & Proposals
            </span>
            <h3 className="font-display font-bold text-2xl mt-1">
              Have an Upcoming Project or Travel Plan?
            </h3>
            <p className="text-xs text-white/75 mt-1 max-w-xl">
              Use our interactive RFQ wizard for Construction civil works, bespoke Holiday bookings, or Enterprise Software proposals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/quote" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2.5 px-6 font-bold whitespace-nowrap">
              Calculate RFQ Quote →
            </a>
            <a href="/portal" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-xs py-2.5 px-6 whitespace-nowrap">
              Access Client Portal
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-brand-surface py-16">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">Testimonials</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">What Our Clients Say</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <blockquote className="card h-full">
                  <Quote className="h-6 w-6 text-brand-gold" />
                  <p className="mt-3 text-sm italic text-gray-700">&ldquo;{t.text}&rdquo;</p>
                  <footer className="mt-4 text-sm">
                    <span className="font-semibold text-brand-navy">{t.name}</span>
                    <span className="block text-xs text-gray-500">{t.role}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
