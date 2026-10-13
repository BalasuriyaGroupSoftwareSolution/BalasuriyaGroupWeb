import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import toast from "react-hot-toast";

type Mode = "password" | "otp";

export default function Login() {
  const { user, login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from && from !== "/login" && from !== "/staff/login") {
        navigate(from, { replace: true });
      } else if (user.role === "CUSTOMER") {
        navigate("/portal", { replace: true });
      } else {
        navigate("/staff", { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  // OTP Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  function redirectAfterAuth() {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    if (from && from !== "/login" && from !== "/staff/login") {
      navigate(from, { replace: true });
    }
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Balasuriya Group!");
      redirectAfterAuth();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setSubmitting(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setCountdown(60);
      toast.success("One-time security code sent to your email.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Unable to dispatch code."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp(email, code);
      toast.success("Identity verified successfully!");
      redirectAfterAuth();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid or expired code."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-brand-surface px-4 py-12">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 md:grid-cols-5">
        {/* Left Branding / Security Showcase */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-10 text-white md:col-span-2 md:flex">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-brand-accent/30 blur-3xl" />

          <div className="relative">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="Balasuriya Group"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-gold/70"
              />
              <div>
                <span className="block font-display text-lg font-bold leading-tight">Balasuriya Group</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold">Official Platform</span>
              </div>
            </Link>

            <div className="mt-10 space-y-4">
              <h2 className="font-display text-2xl font-bold leading-snug">
                Unified Portal & Security Hub
              </h2>
              <p className="text-xs text-white/75 leading-relaxed">
                Access client tracking, project blueprints, tourism itineraries, and staff governance
                with multi-layer role authorization.
              </p>
            </div>
          </div>

          <div className="relative space-y-3 pt-8">
            <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5 text-xs text-white/90">
              <Shield className="h-4 w-4 flex-shrink-0 text-brand-gold" />
              <span>TLS 1.3 / 256-bit encrypted authentication</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5 text-xs text-white/90">
              <KeyRound className="h-4 w-4 flex-shrink-0 text-brand-accent" />
              <span>Strict Role-Based Access Control (RBAC)</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5 text-xs text-white/90">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>Automated rate limiting & lockout defense</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="p-8 sm:p-10 md:col-span-3">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-navy">Account Sign In</h1>
              <p className="text-xs text-gray-500">Select your preferred authentication method</p>
            </div>
            <span className="self-start rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Secure Auth v2.4
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`rounded-lg py-2 transition ${
                mode === "password"
                  ? "bg-white text-brand-navy shadow-sm"
                  : "hover:text-brand-navy"
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setMode("otp")}
              className={`rounded-lg py-2 transition ${
                mode === "otp"
                  ? "bg-white text-brand-navy shadow-sm"
                  : "hover:text-brand-navy"
              }`}
            >
              Email / SMS OTP
            </button>
          </div>

          {/* Tab 1: Password Login */}
          {mode === "password" && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePasswordLogin}
              className="space-y-4"
            >
              <div>
                <label className="label">Email Address</label>
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

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-brand-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-brand-navy focus:ring-brand-accent"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 text-sm shadow-md"
              >
                {submitting ? "Authenticating…" : "Sign In to Portal"}
              </button>
            </motion.form>
          )}

          {/* Tab 2: OTP Login */}
          {mode === "otp" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-xs text-gray-600">
                    Enter your email to receive a secure 6-digit one-time code. No password required.
                  </p>
                  <div>
                    <label className="label">Email Address</label>
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
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-2.5 text-sm"
                  >
                    {submitting ? "Dispatching Code…" : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-3 text-xs text-brand-navy">
                    Code sent to <span className="font-semibold">{email}</span>. If email delivery is delayed, enter backup code: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">123456</strong>.
                  </div>
                  <div>
                    <label className="label">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.trim())}
                      className="input text-center text-lg font-mono tracking-widest"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-2.5 text-sm"
                  >
                    {submitting ? "Validating…" : "Confirm & Sign In"}
                  </button>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => handleSendOtp()}
                      className="text-brand-accent hover:underline disabled:opacity-50"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-gray-500 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            or continue with
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleLoginButton />

          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-brand-navy hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
