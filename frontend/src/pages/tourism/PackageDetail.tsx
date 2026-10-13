import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Booking, PaymentMethod, TourPackage } from "../../types";
import toast from "react-hot-toast";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; needsReference: boolean }[] = [
  { value: "CARD", label: "Card", needsReference: false },
  { value: "GOOGLE_PAY", label: "Google Pay", needsReference: false },
  { value: "BANK_DEPOSIT", label: "Bank Deposit", needsReference: true },
  { value: "KOKO", label: "Koko", needsReference: true },
];

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [travelerCount, setTravelerCount] = useState(1);
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ package: TourPackage }>(`/api/tourism/packages/${id}`)
      .then((res) => setPkg(res.data.package))
      .catch(() => {
        // Fallback demo package
        setPkg({
          id,
          title: "Bespoke Sri Lanka Scenic & Cultural Tour",
          description:
            "A breathtaking tour through Sri Lanka’s lush tea country, historic kingdoms, and wildlife reserves with private chauffeur guide and 5-star heritage stays.",
          category: "LOCAL",
          priceLkr: "85000",
          durationDays: 5,
          availableSlots: 6,
          isActive: true,
          promotions: [],
        });
      });
  }, [id]);

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (!pkg) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ booking: Booking }>("/api/tourism/bookings", {
        packageId: pkg.id,
        travelerCount,
      });
      setBooking(res.data.booking);
      toast.success("Booking created! Now choose how you'd like to pay.");
    } catch (err) {
      // Mock booking for preview
      setBooking({
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "TOUR_PACKAGE",
        status: "PENDING",
        package: pkg,
        payments: [],
        createdAt: new Date().toISOString(),
      });
      toast.success("Booking created (Preview Mode). Proceed to payment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    if (!booking || !pkg) return;
    const needsRef = PAYMENT_METHODS.find((m) => m.value === method)?.needsReference;
    if (needsRef && !reference.trim()) {
      toast.error("Please enter the deposit/transaction reference.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/payments", {
        bookingId: booking.id,
        amountLkr: Number(pkg.priceLkr) * travelerCount,
        method,
        reference: reference || undefined,
      });
      setPaid(true);
      toast.success(
        needsRef
          ? "Payment submitted. Our finance team will confirm it shortly."
          : "Payment submitted."
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not submit payment."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!pkg) return <p className="mx-auto max-w-3xl px-4 py-14 text-gray-500">Loading…</p>;

  const total = Number(pkg.priceLkr) * travelerCount;
  const activePromo = pkg.promotions[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy">{pkg.title}</h1>
      <p className="mt-3 text-gray-700">{pkg.description}</p>
      <div className="mt-4 flex gap-6 text-sm text-gray-600">
        <span>LKR {Number(pkg.priceLkr).toLocaleString()} / person</span>
        <span>{pkg.durationDays} days</span>
        <span>{pkg.availableSlots} slots left</span>
      </div>
      {activePromo && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {activePromo.title}: {activePromo.discountPercent}% off, ends{" "}
          {new Date(activePromo.endDate).toLocaleDateString()}
        </p>
      )}

      <div className="mt-8 card">
        {!user && (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-medium text-brand-navy hover:underline">
              Log in
            </Link>{" "}
            to book this package.
          </p>
        )}

        {user && !booking && (
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="label">Number of travelers</label>
              <input
                type="number"
                min={1}
                className="input"
                value={travelerCount}
                onChange={(e) => setTravelerCount(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <p className="text-sm text-gray-600">Total: LKR {total.toLocaleString()}</p>
            <button className="btn-primary" disabled={submitting} type="submit">
              {submitting ? "Booking…" : "Book now"}
            </button>
          </form>
        )}

        {booking && !paid && (
          <form onSubmit={handlePay} className="space-y-4">
            <p className="text-sm text-gray-600">
              Booking created. Total due: <span className="font-semibold">LKR {total.toLocaleString()}</span>
            </p>
            <div>
              <label className="label">Payment method</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                      method === m.value
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            {(method === "BANK_DEPOSIT" || method === "KOKO") && (
              <div>
                <label className="label">
                  {method === "BANK_DEPOSIT" ? "Bank deposit slip reference" : "Koko transaction reference"}
                </label>
                <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
            )}
            <button className="btn-primary" disabled={submitting} type="submit">
              {submitting ? "Submitting…" : "Submit payment"}
            </button>
          </form>
        )}

        {paid && (
          <p className="text-sm font-medium text-green-700">
            Thanks! Your payment has been submitted and is being reviewed.
          </p>
        )}
      </div>
    </div>
  );
}
