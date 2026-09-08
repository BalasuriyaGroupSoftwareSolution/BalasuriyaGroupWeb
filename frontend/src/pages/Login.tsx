import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import toast from "react-hot-toast";

type Mode = "password" | "otp-request" | "otp-verify";

export default function Login() {
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendOtp(email);
      toast.success("Code sent — check your email.");
      setMode("otp-verify");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await verifyOtp(email, code);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid or expired code."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Log in</h1>

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Logging in…" : "Log in"}
            </button>
            <button type="button" className="w-full text-center text-xs text-brand-accent" onClick={() => setMode("otp-request")}>
              Log in with a one-time code instead
            </button>
          </form>
        )}

        {mode === "otp-request" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Sending…" : "Send code"}
            </button>
            <button type="button" className="w-full text-center text-xs text-brand-accent" onClick={() => setMode("password")}>
              Back to password login
            </button>
          </form>
        )}

        {mode === "otp-verify" && (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="label">6-digit code</label>
              <input
                className="input tracking-widest"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Verifying…" : "Verify & log in"}
            </button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleLoginButton />

        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{" "}
          <Link to="/register" className="font-medium text-brand-navy hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
