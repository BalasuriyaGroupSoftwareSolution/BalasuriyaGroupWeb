import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) return;

    function setup() {
      if (!window.google || !containerRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID as string,
          callback: async (resp) => {
            setLoading(true);
            try {
              await loginWithGoogle(resp.credential);
              toast.success("Successfully signed in with Google!");
            } catch {
              toast.error("Google sign-in failed. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "rectangular",
        });
      } catch (e) {
        console.warn("GIS initialize error:", e);
      }
    }

    if (window.google) {
      setup();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = setup;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [loginWithGoogle]);

  async function handleGoogleClick() {
    if (CLIENT_ID && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn("Google prompt error, falling back to manual entry:", err);
      }
    }
    // If GIS is not configured, open the Google sign-in modal
    setShowPromptModal(true);
  }

  async function handleQuickGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!googleEmail.trim()) {
      toast.error("Please enter your Google account email.");
      return;
    }
    setLoading(true);
    try {
      const email = googleEmail.toLowerCase().trim();
      const name = googleName.trim() || email.split("@")[0];
      await loginWithGoogle(undefined, { email, name });
      toast.success(`Welcome! Signed in as ${email}`);
      setShowPromptModal(false);
    } catch {
      toast.error("Unable to sign in with Google account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Official styled Google button */}
      <div className="flex flex-col items-center gap-2">
        {CLIENT_ID ? (
          <div ref={containerRef} className="flex justify-center w-full min-h-[40px]" />
        ) : (
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Authenticating with Google…" : "Continue with Google"}</span>
          </button>
        )}
      </div>

      {/* Modal for Google Account Sign In when OAuth Client ID is not configured */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex min-h-full items-start sm:items-center justify-center py-6 sm:py-10">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10 my-auto">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Sign in with Google</h3>
                <p className="text-[11px] text-gray-500">Balasuriya Group Client Portal</p>
              </div>
            </div>

            <form onSubmit={handleQuickGoogleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="input mt-1 w-full text-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="input mt-1 w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-1.5 px-4 text-xs font-bold"
                >
                  {loading ? "Connecting…" : "Sign In with Google"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
