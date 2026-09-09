import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Reveal } from "../../components/Reveal";
import type { ConstructionProject } from "../../types";

export default function ConstructionPublic() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ projects: ConstructionProject[] }>("/api/construction/projects")
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError("Couldn't load projects right now. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy to-brand-steel py-20 text-white">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"
          >
            <Building2 className="h-7 w-7 text-brand-gold" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Construction Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/80"
          >
            A look at what we're building, and how far along each project is.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {loading && <p className="text-gray-500">Loading projects…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-gray-500">No projects published yet — check back soon.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const latest = p.progressUpdates[0];
            return (
              <Reveal key={p.id} delay={i * 0.06}>
                <Link to={`/construction/${p.id}`} className="card block h-full hover:shadow-lg hover:-translate-y-1 transition">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-brand-navy">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                  )}
                  {latest && (
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${latest.percentComplete}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-gold"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{latest.percentComplete}% complete</p>
                    </div>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
