import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const msg = await forgotPassword(email);
      toast.success(msg || "Reset code dispatched. Please check your inbox and spam folder.", { duration: 8000 });
      setStep("reset");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to send reset code."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, code, newPassword);
      toast.success("Password reset successful! Logging you in…");
      navigate("/portal", { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid code or failed to reset password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-brand-surface px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5"
      >
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-steel hover:text-brand-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-navy">Reset Password</h1>
            <p className="text-xs text-gray-500">Secure Account Recovery Protocol</p>
          </div>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the email address associated with your Balasuriya Group account. We will send you
              a 6-digit one-time verification code to securely reset your credentials.
            </p>

            <div>
              <label className="label">Registered Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Sending Code…" : "Send Reset Code"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Protected by 256-bit rate-limited security</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />
              Verification code sent to <strong className="font-semibold">{email}</strong>. Please check your inbox and spam folder.
            </div>

            <div>
              <label className="label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="• • • • • •"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                className="input text-center text-lg font-mono tracking-widest"
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Resetting…" : "Set New Password & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center text-xs text-gray-500 hover:text-brand-navy"
            >
              Didn't receive a code? Try another email
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
