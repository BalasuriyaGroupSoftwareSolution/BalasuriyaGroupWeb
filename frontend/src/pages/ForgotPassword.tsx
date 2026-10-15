import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [linkToken, setLinkToken] = useState(tokenParam);
  // steps: "request" (enter email) | "sent" (link dispatched, wait for email click) | "reset" (user clicked email link, choose new password)
  const [step, setStep] = useState<"request" | "sent" | "reset">(tokenParam ? "reset" : "request");
  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Sync token from URL query params (when user clicks link in email)
  useEffect(() => {
    const t = searchParams.get("token");
    const em = searchParams.get("email");
    if (t) {
      setLinkToken(t);
      setStep("reset");
    }
    if (em) {
      setEmail(em);
    }
  }, [searchParams]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "bg-gray-200" };
    let s = 0;
    if (newPassword.length >= 8) s += 1;
    if (newPassword.length >= 12) s += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) s += 1;
    if (/[0-9]/.test(newPassword)) s += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) s += 1;

    if (s <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (s <= 3) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (s <= 4) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  }, [newPassword]);

  async function handleRequestLink(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const msg = await forgotPassword(email);
      toast.success(msg || "Password reset link dispatched to your email.", { duration: 8000 });
      setStep("sent");
      setCountdown(45);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to send reset email. Please ensure your email is registered."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!linkToken) {
      toast.error("No valid reset token detected. Please open the link from your email.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, "", newPassword, linkToken);
      toast.success("Password reset successful! Welcome back to Balasuriya Group.");
      navigate("/portal", { replace: true });
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          "Invalid or expired password reset link. Please request a new link."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-brand-surface px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-white p-8 sm:p-10 shadow-2xl ring-1 ring-black/5"
      >
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-steel hover:text-brand-navy transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
        </Link>

        {/* Corporate Header */}
        <div className="mb-8 flex items-center gap-3.5 border-b border-gray-100 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-md">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-navy">
              {step === "reset" ? "Set New Password" : "Password Recovery"}
            </h1>
            <p className="text-xs text-gray-500">Balasuriya Group Corporate Identity Protocol</p>
          </div>
        </div>

        {/* STEP 1: Request Reset Link */}
        {step === "request" && (
          <form onSubmit={handleRequestLink} className="space-y-5">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Enter your registered Balasuriya Group company email address. We will dispatch a secure 1-click
              password reset link directly to your inbox.
            </p>

            <div>
              <label className="label">Registered Company Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@balasuriyagroup.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Dispatching Secure Link…" : "Send Password Reset Link"}
            </button>

            {/* Corporate Security Badges */}
            <div className="mt-6 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500 space-y-2 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-navy" />
                <span>Protected by 256-bit cryptographically signed single-use links</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                <span>100% Direct Reset Link — No verification codes required</span>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Link Sent Confirmation Screen */}
        {step === "sent" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-lg font-bold text-emerald-950 mb-1">
                Password Reset Link Dispatched
              </h2>
              <p className="text-xs text-emerald-800 leading-relaxed">
                We sent a secure, single-use password reset link to:
              </p>
              <div className="mt-2 font-mono text-xs font-bold text-emerald-900 bg-white/80 py-1.5 px-3 rounded-md inline-block border border-emerald-200">
                {email}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200/70 p-4 text-xs text-gray-700 space-y-3">
              <div className="font-semibold text-brand-navy flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-navy" />
                <span>Next Steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-600 text-xs">
                <li>Open your email inbox at <strong>{email}</strong>.</li>
                <li>Look for the email with subject: <strong>Reset your Balasuriya Group password</strong>.</li>
                <li>Click the <strong>[ Reset My Password ]</strong> button inside the email.</li>
              </ol>

              <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 leading-relaxed">
                <strong>Gmail Tip:</strong> If you do not see it in your Primary inbox, please check your <strong>Spam</strong> or <strong>Updates</strong> tab, or search <code>from:security@balasuriyagroup.tech</code> in Gmail.
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={countdown > 0 || submitting}
                onClick={() => handleRequestLink()}
                className="btn-secondary w-full py-2.5 text-xs font-semibold"
              >
                {countdown > 0 ? `Resend email in ${countdown}s` : "Resend Password Reset Email"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setLinkToken("");
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-brand-navy py-1.5 transition"
              >
                Entered the wrong email? Click here to change email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Set New Password (Opened via link from email) */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Direct Reset Link Verified
              </div>
              <div className="text-emerald-800 leading-relaxed">
                Resetting credentials for <strong className="font-semibold">{email}</strong>. Please define your new corporate password below.
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="label">New Corporate Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-gray-700">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold shadow-md"
            >
              {submitting ? "Securing Credentials…" : "Update Password & Sign In"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
