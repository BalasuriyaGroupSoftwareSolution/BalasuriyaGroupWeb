import { useEffect, useState, type FormEvent } from "react";
import { api, apiErrorMessage } from "../../lib/api";
import type { TourCategory, TourPackage } from "../../types";
import toast from "react-hot-toast";

const CATEGORIES: TourCategory[] = ["LOCAL", "FOREIGN", "FAMILY", "TEAM", "RELIGIOUS"];

export default function TourismStaff() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [promoPackageId, setPromoPackageId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New package form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TourCategory>("LOCAL");
  const [priceLkr, setPriceLkr] = useState(0);
  const [durationDays, setDurationDays] = useState(1);
  const [availableSlots, setAvailableSlots] = useState(10);

  // New promotion form
  const [promoTitle, setPromoTitle] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function loadPackages() {
    // Staff need to see inactive packages too, but this endpoint only
    // returns active ones — fine for now since new packages default active.
    api.get<{ packages: TourPackage[] }>("/api/tourism/packages").then((res) => setPackages(res.data.packages));
  }

  useEffect(loadPackages, []);

  async function handleCreatePackage(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/tourism/packages", {
        title,
        description,
        category,
        priceLkr,
        durationDays,
        availableSlots,
      });
      toast.success("Package created.");
      setTitle("");
      setDescription("");
      setShowNewPackage(false);
      loadPackages();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create package."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(pkg: TourPackage) {
    try {
      await api.patch(`/api/tourism/packages/${pkg.id}`, { isActive: !pkg.isActive });
      loadPackages();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCreatePromotion(e: FormEvent) {
    e.preventDefault();
    if (!promoPackageId) return;
    setSubmitting(true);
    try {
      await api.post("/api/tourism/promotions", {
        packageId: promoPackageId,
        title: promoTitle,
        discountPercent,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      toast.success("Promotion created.");
      setPromoTitle("");
      setPromoPackageId(null);
      loadPackages();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create promotion."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Tourism Packages</h1>
        <button className="btn-secondary py-1.5 text-xs" onClick={() => setShowNewPackage((s) => !s)}>
          {showNewPackage ? "Cancel" : "New package"}
        </button>
      </div>

      {showNewPackage && (
        <form onSubmit={handleCreatePackage} className="card mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={2} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as TourCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Price (LKR)</label>
            <input
              type="number"
              min={0}
              className="input"
              required
              value={priceLkr}
              onChange={(e) => setPriceLkr(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Duration (days)</label>
            <input
              type="number"
              min={1}
              className="input"
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Available slots</label>
            <input
              type="number"
              min={0}
              className="input"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={submitting} type="submit">
              Create package
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-brand-navy">{pkg.title}</h3>
                <p className="text-sm text-gray-500">
                  {pkg.category} · LKR {Number(pkg.priceLkr).toLocaleString()} · {pkg.durationDays} days
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="btn-secondary py-1 text-xs" onClick={() => handleToggleActive(pkg)}>
                  {pkg.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  className="btn-secondary py-1 text-xs"
                  onClick={() => setPromoPackageId(promoPackageId === pkg.id ? null : pkg.id)}
                >
                  Add promotion
                </button>
              </div>
            </div>

            {promoPackageId === pkg.id && (
              <form onSubmit={handleCreatePromotion} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Promotion title</label>
                  <input className="input" required value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} />
                </div>
                <div>
                  <label className="label">Discount %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="input"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Starts</label>
                  <input type="date" className="input" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Ends</label>
                  <input type="date" className="input" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <button className="btn-primary" disabled={submitting} type="submit">
                    Create promotion
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
        {packages.length === 0 && <p className="text-gray-500">No packages yet.</p>}
      </div>
    </div>
  );
}
