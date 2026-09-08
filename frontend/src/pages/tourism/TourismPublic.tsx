import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { TourCategory, TourPackage } from "../../types";

const CATEGORIES: { value: TourCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LOCAL", label: "Local Tours" },
  { value: "FOREIGN", label: "Foreign Tours" },
  { value: "FAMILY", label: "Family Tours" },
  { value: "TEAM", label: "Team Tours" },
  { value: "RELIGIOUS", label: "Religious Tours" },
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
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy">Tourism</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Local tours across Sri Lanka, plus foreign trips for families, teams, and religious
        pilgrimages — with visa assistance and air ticket booking arranged for you.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === c.value ? "bg-brand-navy text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-gray-500">Loading packages…</p>}
      {!loading && packages.length === 0 && (
        <p className="mt-8 text-gray-500">No packages in this category yet — check back soon.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const promo = pkg.promotions[0];
          return (
            <Link key={pkg.id} to={`/tourism/${pkg.id}`} className="card block hover:shadow-md">
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
                <span className="font-semibold text-brand-navy">LKR {Number(pkg.priceLkr).toLocaleString()}</span>
                <span className="text-gray-500">{pkg.durationDays} days</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
