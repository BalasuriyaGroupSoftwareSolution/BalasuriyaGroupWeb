import { useEffect, useRef } from "react";
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
        };
      };
    };
  }
}

/**
 * Renders Google's official "Sign in with Google" button once the Google
 * Identity Services script has loaded. Requires VITE_GOOGLE_CLIENT_ID to be
 * set to the same OAuth Client ID the backend checks (GOOGLE_CLIENT_ID) —
 * without it, this renders nothing rather than a broken button.
 */
export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;

    function setup() {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID as string,
        callback: async (resp) => {
          try {
            await loginWithGoogle(resp.credential);
          } catch {
            toast.error("Google sign-in failed. Please try again.");
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 280,
      });
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
      document.body.removeChild(script);
    };
  }, [loginWithGoogle]);

  if (!CLIENT_ID) {
    return (
      <p className="text-xs text-gray-400">
        Google sign-in isn't configured yet (missing VITE_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return <div ref={containerRef} />;
}
