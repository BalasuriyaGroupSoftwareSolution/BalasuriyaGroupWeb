import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, apiErrorMessage, clearToken, getToken, purgeLegacyBrowserData, setToken } from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  sendOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, newPassword: string, resetToken: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Every sign-in goes through the server. There are no offline/"fallback"
 * logins: if the server can't confirm who you are, you are not signed in.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const res = await api.get<{ user: User }>("/api/auth/me");
      setUser(res.data.user);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearToken();
        setUser(null);
      }
      // Network blip: keep the token, try again on next load.
    }
  }, []);

  useEffect(() => {
    purgeLegacyBrowserData();
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  function acceptSession(data: { token: string; user: User }) {
    setToken(data.token);
    setUser(data.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await api.post("/api/auth/login", { email: email.toLowerCase().trim(), password });
        acceptSession(res.data);
      },
      async register(name, email, password, phone) {
        const res = await api.post("/api/auth/register", {
          name,
          email: email.toLowerCase().trim(),
          password,
          phone: phone || undefined,
        });
        acceptSession(res.data);
      },
      async loginWithGoogle(idToken) {
        const res = await api.post("/api/auth/google", { idToken });
        acceptSession(res.data);
      },
      async sendOtp(identifier) {
        await api.post("/api/auth/otp/send", { identifier: identifier.toLowerCase().trim() });
      },
      async verifyOtp(identifier, code) {
        const res = await api.post("/api/auth/otp/verify", { identifier: identifier.toLowerCase().trim(), code });
        acceptSession(res.data);
      },
      async forgotPassword(email) {
        const res = await api.post("/api/auth/forgot-password", { email: email.toLowerCase().trim() });
        return res.data?.message || "If an account exists for that email, a reset link has been sent.";
      },
      async resetPassword(email, newPassword, resetToken) {
        if (!resetToken) throw new Error("Please use the reset link from your email.");
        const res = await api.post("/api/auth/reset-password", {
          email: email.toLowerCase().trim(),
          newPassword,
          resetToken: resetToken.trim(),
        });
        acceptSession(res.data);
      },
      async changePassword(currentPassword, newPassword) {
        await api.post("/api/auth/change-password", { currentPassword, newPassword });
      },
      async updateProfile(data) {
        const res = await api.patch("/api/auth/profile", data);
        setUser(res.data.user);
      },
      refreshUser,
      logout() {
        clearToken();
        setUser(null);
      },
    }),
    [user, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { apiErrorMessage };
