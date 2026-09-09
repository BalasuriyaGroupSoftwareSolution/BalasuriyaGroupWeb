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
        className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-brand-accent/40"
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
      <div>
        <h4 className="font-semibold text-brand-navy">{person.name}</h4>
        <p className="text-sm text-gray-600">{person.role}</p>
        {person.email && (
          <a href={`mailto:${person.email}`} className="text-xs text-brand-accent hover:underline">
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
            <div className="card h-full">
              <h2 className="font-display text-xl font-bold text-brand-navy">Mission</h2>
              <p className="mt-2 text-sm text-gray-700">
                To provide innovative, reliable, and customer-focused services while expanding across
                multiple industries with excellence and integrity.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card h-full">
              <h2 className="font-display text-xl font-bold text-brand-navy">Vision</h2>
              <p className="mt-2 text-sm text-gray-700">
                To become a globally recognized diversified business group known for innovation,
                technology, leadership, and customer trust.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl font-bold text-brand-navy">Meet Our Directors</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {directors.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.08}>
                <PersonCard person={d} onView={setSelected} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <Reveal className="text-center">
          <h2 className="font-display text-2xl font-bold text-brand-navy">Department Leadership</h2>
        </Reveal>
        <div className="mt-8 space-y-8">
          {departments.map((dept, di) => (
            <Reveal key={dept.id} delay={di * 0.05}>
              <div>
                <h3 className="font-semibold text-brand-navy">{dept.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{dept.description}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {dept.members.map((m) => (
                    <PersonCard key={`${dept.id}-${m.name}`} person={m} onView={setSelected} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
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
