import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../lib/api";
import type { Payment } from "../../types";
import toast from "react-hot-toast";

export default function PaymentApprovals() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<{ payments: Payment[] }>("/api/payments/pending")
      .then((res) => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function decide(id: string, action: "approve" | "reject") {
    try {
      await api.patch(`/api/payments/${id}/${action}`, {});
      toast.success(action === "approve" ? "Payment approved." : "Payment rejected.");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Payment Approvals</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bank deposit and Koko payments wait here until confirmed. Card and Google Pay settle
        automatically once that gateway is connected.
      </p>

      {loading && <p className="mt-6 text-gray-500">Loading…</p>}
      {!loading && payments.length === 0 && <p className="mt-6 text-gray-500">Nothing pending.</p>}

      <div className="mt-6 space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-brand-navy">
                LKR {Number(p.amountLkr).toLocaleString()} · {p.method.replace(/_/g, " ")}
              </p>
              {p.reference && <p className="text-sm text-gray-500">Reference: {p.reference}</p>}
              <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="btn-primary py-1.5 text-xs" onClick={() => decide(p.id, "approve")}>
                Approve
              </button>
              <button
                className="rounded-md border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                onClick={() => decide(p.id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
