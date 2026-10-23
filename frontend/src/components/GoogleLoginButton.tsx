import { useEffect, useRef, useState } from "react";
import { useAuth, apiErrorMessage } from "../context/AuthContext";
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
              toast.success("Signed in with Google.");
            } catch (err) {
              toast.error(apiErrorMessage(err, "Google sign-in failed. Please try again."));
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
        console.warn("Google sign-in could not start:", e);
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

  // Google sign-in only appears when it is properly configured (VITE_GOOGLE_CLIENT_ID).
  // There is intentionally no "type your Google email" fallback: that let anyone
  // sign in as any email address without proving they own it.
  if (!CLIENT_ID) return null;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div ref={containerRef} className="flex justify-center w-full min-h-[40px]" />
      {loading && <p className="text-[11px] text-gray-500">Signing in with Google…</p>}
    </div>
  );
}
