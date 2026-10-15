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
  ShieldAlert,
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
  const [step, setStep] = useState<"request" | "reset">(tokenParam ? "reset" : "request");
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Sync search parameters from URL (e.g. when user clicks link in email)
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
      toast.success(msg || "Password reset link sent! Please check your email inbox and spam folder.", {
        duration: 8000,
      });
      setStep("reset");
      setCountdown(45);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to send reset email. Please ensure your email is correct."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!linkToken && (!code || code.length !== 6)) {
      toast.error("Please enter the 6-digit verification code sent to your email.");
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
      await resetPassword(email, code, newPassword, linkToken || undefined);
      toast.success("Password reset successful! Logging you into your corporate portal…");
      navigate("/portal", { replace: true });
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          "Invalid or expired link/code. For security, please request a fresh password reset link."
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
              {step === "request" ? "Password Recovery" : "Set New Password"}
            </h1>
            <p className="text-xs text-gray-500">Balasuriya Group Corporate Identity Protocol</p>
          </div>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestLink} className="space-y-5">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Enter your registered Balasuriya Group email address. We will dispatch a secure, single-use
              password reset link directly to your inbox.
            </p>

            <div>
              <label className="label">Registered Corporate Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
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

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold shadow-md"
            >
              {submitting ? "Dispatching Secure Link…" : "Send Password Reset Link"}
            </button>

            {/* Corporate Security Badges */}
            <div className="mt-6 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500 space-y-2 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-navy" />
                <span>Protected by 256-bit cryptographically signed HMAC tokens</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
                <span>One-click direct reset — no code memorization required</span>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Context Verification Banner */}
            {linkToken ? (
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-4 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-950 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Identity Link Verified
                </div>
                <div className="text-emerald-800 leading-relaxed">
                  Resetting credentials for <strong className="font-semibold">{email}</strong>. Please define your new secure password below.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50/70 border border-blue-200/70 p-4 text-xs text-blue-900">
                  <div className="flex items-center gap-2 font-bold text-blue-950 mb-1">
                    <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                    Reset Instructions Dispatched
                  </div>
                  <div className="text-blue-800 leading-relaxed">
                    A password reset link was sent to <strong className="font-semibold">{email}</strong>. Check your inbox and spam folder.
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200/60 text-[11px] text-blue-700">
                    <strong>Gmail Tip:</strong> If not in Primary, check your <strong>Spam</strong> or <strong>Updates</strong> tab (or search <code>from:security@balasuriyagroup.tech</code>).
                  </div>
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
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <button
                      type="button"
                      disabled={countdown > 0 || submitting}
                      onClick={() => handleRequestLink()}
                      className="font-medium text-brand-accent hover:underline disabled:opacity-50"
                    >
                      {countdown > 0 ? `Resend email in ${countdown}s` : "Resend Email"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("request");
                        setLinkToken("");
                      }}
                      className="text-gray-400 hover:text-brand-navy"
                    >
                      Change email
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Tip: You can also simply click the <strong>&quot;Reset My Password&quot;</strong> button inside your email to bypass this code.
                  </p>
                </div>
              </div>
            )}

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

            <button
              type="button"
              onClick={() => {
                setStep("request");
                setLinkToken("");
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-brand-navy pt-2"
            >
              Need to send to a different email address?
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
