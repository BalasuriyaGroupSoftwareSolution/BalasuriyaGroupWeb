import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ZoomIn } from "lucide-react";
import { companyValues, contactInfo, departments, directors, type TeamMember } from "../data/companyProfile";
import { Reveal } from "../components/Reveal";
import { PersonModal } from "../components/PersonModal";

const teamImages = import.meta.glob<{ default: string }>("../assets/team/*.jpg", { eager: true });

function teamImage(file: string) {
  const match = Object.entries(teamImages).find(([path]) => path.endsWith(file));
  return match?.[1].default;
}

function PersonCard({ person, onView }: { person: TeamMember; onView: (p: TeamMember) => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card flex items-center gap-4">
      <button
        onClick={() => onView(person)}
        aria-label={`View photo of ${person.name}`}
        className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-brand-gold/60"
      >
        <img
          src={teamImage(person.image)}
          alt={person.name}
          className="h-full w-full object-cover transition group-hover:scale-110"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
          <ZoomIn className="h-5 w-5 text-white" />
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-brand-navy truncate">{person.name}</h4>
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">{person.role}</p>
        {person.departmentScope && (
          <p className="text-xs text-gray-500 mt-0.5">{person.departmentScope}</p>
        )}
        {person.email && (
          <a href={`mailto:${person.email}`} className="mt-1 block text-xs text-brand-accent hover:underline truncate">
            {person.email}
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function About() {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-bold"
          >
            About Balasuriya Group
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-white/85"
          >
            Balasuriya Group was founded with the vision of building innovative and trusted business
            solutions across multiple industries. From tourism to construction and, soon, software
            engineering, we focus on delivering quality services, modern solutions, and customer
            satisfaction through leadership, innovation, and teamwork.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          <Reveal>
            <div className="card h-full border-l-4 border-l-brand-accent">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">Our Direction</span>
              <h2 className="mt-1 font-display text-2xl font-bold text-brand-navy">Vision</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                &ldquo;To be Sri Lanka’s most trusted multi-industry group, shaping the nation’s technology, infrastructure, and tourism sectors to connect people, spaces, and opportunities with the world&rdquo;
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full border-l-4 border-l-brand-gold">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Our Purpose</span>
              <h2 className="mt-1 font-display text-2xl font-bold text-brand-navy">Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                &ldquo;Driven by integrity and operational excellence, we empower possibilities and build tomorrow across Sri Lanka and beyond, delivering intelligent software, enduring construction, and seamless global travel experiences&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Balasuriya Group Management Structure
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">Executive Leadership</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
              Strategic governance, executive direction, and multi-industry oversight across the Balasuriya Group.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {directors.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.08}>
                <PersonCard person={d} onView={setSelected} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Division Heads & Operational Leaders */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <Reveal className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Operational Excellence
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
            Division Heads & Operational Leaders
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
            Heading operational delivery, engineering implementation, and logistics execution across our subsidiaries.
          </p>
        </Reveal>
        <div className="mt-8 space-y-8">
          {departments.map((dept, di) => (
            <Reveal key={dept.id} delay={di * 0.05}>
              <div className="rounded-2xl border border-gray-100 bg-white/70 p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-brand-navy">{dept.title}</h3>
                <p className="mt-1 text-xs text-gray-600">{dept.description}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {dept.members.map((m) => (
                    <PersonCard key={`${dept.id}-${m.name}`} person={m} onView={setSelected} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Organizational Principle Hierarchy */}
      <section className="bg-brand-surface py-12 border-y border-black/5">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/60">
              Governance Framework
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-brand-navy">
              Final Organizational Principle
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Clear reporting lines and accountability across all corporate tiers
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="rounded-xl bg-brand-navy px-4 py-2.5 text-white shadow-sm">
              Board / Shareholders
            </span>
            <span className="text-brand-gold font-bold">→</span>
            <span className="rounded-xl bg-white px-4 py-2.5 text-brand-navy ring-1 ring-black/10 shadow-sm">
              CEO
            </span>
            <span className="text-brand-gold font-bold">→</span>
            <span className="rounded-xl bg-white px-4 py-2.5 text-brand-navy ring-1 ring-black/10 shadow-sm">
              MD
            </span>
            <span className="text-brand-gold font-bold">→</span>
            <span className="rounded-xl bg-white px-4 py-2.5 text-brand-navy ring-1 ring-black/10 shadow-sm">
              ED & Company Secretary
            </span>
            <span className="text-brand-gold font-bold">→</span>
            <span className="rounded-xl bg-white px-4 py-2.5 text-brand-navy ring-1 ring-black/10 shadow-sm">
              Director & Shareholder
            </span>
            <span className="text-brand-gold font-bold">→</span>
            <span className="rounded-xl bg-brand-gold px-4 py-2.5 text-brand-navy font-bold shadow-sm">
              Division Heads & Operational Leaders
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl font-bold text-brand-navy">Company Values</h2>
          </Reveal>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {companyValues.map((v, i) => (
              <motion.span
                key={v}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-full bg-brand-surface px-4 py-2 text-sm font-medium text-brand-navy ring-1 ring-black/5"
              >
                {v}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <Reveal>
          <div className="card">
            <h2 className="font-semibold text-brand-navy">Get in touch</h2>
            <p className="mt-2 text-sm text-gray-600">{contactInfo.address}</p>
            <p className="text-sm text-gray-600">{contactInfo.phone}</p>
            <p className="text-sm text-gray-600">{contactInfo.email}</p>
            <p className="text-sm text-gray-600">balasuriyagroup.tech</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={contactInfo.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary py-1.5 text-xs"
              >
                Chat on WhatsApp
              </a>
              <Link to="/contact" className="btn-primary py-1.5 text-xs">
                Send us a message
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <PersonModal
        person={selected}
        imageSrc={selected ? teamImage(selected.image) : undefined}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
