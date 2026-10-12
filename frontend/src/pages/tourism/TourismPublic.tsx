import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Compass,
  Globe2,
  Landmark,
  MapPin,
  Palmtree,
  Plane,
  Sparkles,
  Users,
} from "lucide-react";
import { api } from "../../lib/api";
import { Reveal } from "../../components/Reveal";
import type { TourCategory, TourPackage } from "../../types";

const CATEGORIES: { value: TourCategory | "ALL"; label: string; icon: typeof Palmtree }[] = [
  { value: "ALL", label: "All Packages", icon: Sparkles },
  { value: "LOCAL", label: "Local Escapes", icon: Palmtree },
  { value: "FOREIGN", label: "International Tours", icon: Globe2 },
  { value: "FAMILY", label: "Family Vacations", icon: Users },
  { value: "TEAM", label: "Corporate Team Trips", icon: Users },
  { value: "RELIGIOUS", label: "Pilgrimage Journeys", icon: Landmark },
];

const FALLBACK_PACKAGES: TourPackage[] = [
  {
    id: "pkg_ella_hill",
    title: "Hill Country & Ella Scenic Splendour",
    description: "5 days exploring Nuwara Eliya tea estates, Horton Plains cloud forest, Nine Arch Bridge, and scenic rail journey.",
    category: "LOCAL",
    priceLkr: "85000",
    durationDays: 5,
    availableSlots: 8,
    isActive: true,
    promotions: [
      {
        id: "promo_1",
        packageId: "pkg_ella_hill",
        title: "Early Bird Special",
        description: "Seasonal promotional discount",
        discountPercent: 15,
        startDate: "2026-09-01",
        endDate: "2026-12-31",
        isActive: true,
      },
    ],
  },
  {
    id: "pkg_sigiriya_cultural",
    title: "Cultural Triangle Heritage & Sigiriya",
    description: "4-day immersive exploration of the Sigiriya rock fortress, Dambulla cave temples, and sacred city of Polonnaruwa.",
    category: "LOCAL",
    priceLkr: "72000",
    durationDays: 4,
    availableSlots: 12,
    isActive: true,
    promotions: [],
  },
  {
    id: "pkg_southern_beaches",
    title: "Southern Coastline & Whale Watching Safari",
    description: "6 days along Mirissa, Unawatuna, and Galle Fort, featuring blue whale ocean safari and turtle conservation sanctuaries.",
    category: "FAMILY",
    priceLkr: "110000",
    durationDays: 6,
    availableSlots: 6,
    isActive: true,
    promotions: [
      {
        id: "promo_2",
        packageId: "pkg_southern_beaches",
        title: "Family Bundle Discount",
        description: "Special family rate",
        discountPercent: 10,
        startDate: "2026-09-01",
        endDate: "2026-12-31",
        isActive: true,
      },
    ],
  },
  {
    id: "pkg_buddhist_pilgrimage",
    title: "Sacred Relics Pilgrimage (Dambadiva / Anuradhapura)",
    description: "7-day comprehensive spiritual journey across Sri Lanka's Atamasthana sacred sites and historic Buddhist stupas.",
    category: "RELIGIOUS",
    priceLkr: "95000",
    durationDays: 7,
    availableSlots: 15,
    isActive: true,
    promotions: [],
  },
  {
    id: "pkg_dubai_express",
    title: "Dubai & Abu Dhabi Luxury Golden Tour",
    description: "5-day foreign tour including flights, desert safari, Burj Khalifa observation deck, and luxury hotel stay.",
    category: "FOREIGN",
    priceLkr: "320000",
    durationDays: 5,
    availableSlots: 10,
    isActive: true,
    promotions: [],
  },
  {
    id: "pkg_corporate_kandy",
    title: "Knuckles Range Corporate Leadership Retreat",
    description: "3-day team building experience featuring guided trekking, outdoor teamwork exercises, and luxury eco-lodge dining.",
    category: "TEAM",
    priceLkr: "65000",
    durationDays: 3,
    availableSlots: 25,
    isActive: true,
    promotions: [],
  },
];

export default function TourismPublic() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [category, setCategory] = useState<TourCategory | "ALL">("ALL");
  const [currency, setCurrency] = useState<"LKR" | "USD">("LKR");
  const [loading, setLoading] = useState(true);

  const LKR_TO_USD = 300;

  useEffect(() => {
    setLoading(true);
    const params = category === "ALL" ? {} : { category };
    api
      .get<{ packages: TourPackage[] }>("/api/tourism/packages", { params })
      .then((res) => {
        if (res.data.packages && res.data.packages.length > 0) {
          setPackages(res.data.packages);
        } else {
          setPackages(
            category === "ALL"
              ? FALLBACK_PACKAGES
              : FALLBACK_PACKAGES.filter((p) => p.category === category)
          );
        }
      })
      .catch(() => {
        setPackages(
          category === "ALL"
            ? FALLBACK_PACKAGES
            : FALLBACK_PACKAGES.filter((p) => p.category === category)
        );
      })
      .finally(() => setLoading(false));
  }, [category]);

  function formatPrice(lkr: number | string) {
    const num = Number(lkr);
    if (currency === "USD") {
      return `$${Math.round(num / LKR_TO_USD).toLocaleString()} USD`;
    }
    return `LKR ${num.toLocaleString()}`;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-brand-navy to-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-gold ring-1 ring-brand-gold/40"
          >
            <Palmtree className="h-4 w-4" />
            Balasuriya Tours & Travels Division
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Curated Journeys Across Sri Lanka & Worldwide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/85 text-base sm:text-lg"
          >
            Experience breathtaking landscapes, ancient UNESCO heritage, and tropical coastlines —
            with private chauffeurs, flight bookings, and visa facilitation.
          </motion.p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/air-ticketing" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2 px-5 flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5" /> Air Ticketing & Visa Desk
            </Link>
            <Link to="/quote" className="btn-secondary border-white/40 text-white hover:bg-white/10 text-xs py-2 px-5">
              Custom Itinerary Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Main Browse Container */}
      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* Controls Bar: Category Pills + Currency Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-accent/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-xs font-bold text-gray-600">
            <button
              onClick={() => setCurrency("LKR")}
              className={`rounded px-2.5 py-1 transition ${currency === "LKR" ? "bg-white text-brand-navy shadow-sm" : ""}`}
            >
              LKR (Rs)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded px-2.5 py-1 transition ${currency === "USD" ? "bg-white text-brand-navy shadow-sm" : ""}`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {loading && <p className="mt-8 text-center text-gray-500">Loading travel packages…</p>}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => {
            const promo = pkg.promotions[0];
            return (
              <Reveal key={pkg.id} delay={i * 0.06}>
                <Link
                  to={`/tourism/${pkg.id}`}
                  className="card group flex h-full flex-col justify-between overflow-hidden p-0 transition duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {pkg.category}
                      </span>
                      {promo && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 animate-pulse">
                          -{promo.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display font-bold text-lg text-brand-navy group-hover:text-brand-steel transition">
                      {pkg.title}
                    </h3>
                    <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 bg-brand-surface p-4">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-gray-400 block">Investment</span>
                        <span className="font-display text-base font-bold text-brand-navy">
                          {formatPrice(pkg.priceLkr)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Duration</span>
                        <span className="font-semibold text-gray-700">{pkg.durationDays} Days</span>
                      </div>
                    </div>
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
