import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Password strength logic
  const criteria = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (criteria.length) score += 1;
    if (criteria.hasUpper) score += 1;
    if (criteria.hasLower) score += 1;
    if (criteria.hasNumberOrSpecial) score += 1;
    return score;
  }, [criteria]);

  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][Math.max(0, strengthScore - 1)] || "Weak";
  const strengthColor = [
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ][Math.max(0, strengthScore - 1)] || "bg-gray-200";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!criteria.length) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the terms of service.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, phone);
      toast.success("Account created successfully! Welcome to Balasuriya Group.");
      navigate("/portal", { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-brand-surface px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 sm:p-10"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-navy">Create Account</h1>
            <p className="text-xs text-gray-500">Access quotes, project updates & travel bookings</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-navy">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Hon. Clemon Balasuriya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Work / Personal Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Contact Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Create strong password"
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

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Security strength:</span>
                  <span className="font-semibold text-brand-navy">{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-colors ${
                        strengthScore >= step ? strengthColor : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Validation checklist */}
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    {criteria.length ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {criteria.hasUpper ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {criteria.hasLower ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span>Lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {criteria.hasNumberOrSpecial ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span>Number or symbol</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 pt-1 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-brand-navy focus:ring-brand-accent"
            />
            <span>
              I agree to Balasuriya Group’s{" "}
              <Link to="/about" className="text-brand-accent hover:underline">
                Terms of Engagement
              </Link>{" "}
              and data protection guidelines.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-sm shadow-md"
          >
            {submitting ? "Registering Account…" : "Create Official Account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or register with
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleLoginButton />

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-navy hover:underline">
            Log in to portal
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
