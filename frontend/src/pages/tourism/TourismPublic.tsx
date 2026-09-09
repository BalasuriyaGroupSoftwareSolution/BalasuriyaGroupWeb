import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Palmtree, Globe2, Users, Landmark, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { Reveal } from "../../components/Reveal";
import type { TourCategory, TourPackage } from "../../types";

const CATEGORIES: { value: TourCategory | "ALL"; label: string; icon: typeof Palmtree }[] = [
  { value: "ALL", label: "All", icon: Sparkles },
  { value: "LOCAL", label: "Local Tours", icon: Palmtree },
  { value: "FOREIGN", label: "Foreign Tours", icon: Globe2 },
  { value: "FAMILY", label: "Family Tours", icon: Users },
  { value: "TEAM", label: "Team Tours", icon: Users },
  { value: "RELIGIOUS", label: "Religious Tours", icon: Landmark },
];

export default function TourismPublic() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [category, setCategory] = useState<TourCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = category === "ALL" ? {} : { category };
    api
      .get<{ packages: TourPackage[] }>("/api/tourism/packages", { params })
      .then((res) => setPackages(res.data.packages))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-brand-navy py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"
          >
            <Palmtree className="h-7 w-7 text-brand-gold" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Tourism
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/80"
          >
            Local tours across Sri Lanka, plus foreign trips for families, teams, and religious
            pilgrimages — with visa assistance and air ticket booking arranged for you.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active ? "bg-brand-navy text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-accent/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {loading && <p className="mt-8 text-gray-500">Loading packages…</p>}
        {!loading && packages.length === 0 && (
          <p className="mt-8 text-gray-500">No packages in this category yet — check back soon.</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => {
            const promo = pkg.promotions[0];
            return (
              <Reveal key={pkg.id} delay={i * 0.06}>
                <Link
                  to={`/tourism/${pkg.id}`}
                  className="card block h-full hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-brand-navy">{pkg.title}</h3>
                    {promo && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        -{promo.discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{pkg.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-brand-navy">
                      LKR {Number(pkg.priceLkr).toLocaleString()}
                    </span>
                    <span className="text-gray-500">{pkg.durationDays} days</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
