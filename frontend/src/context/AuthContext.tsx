import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, apiErrorMessage, clearToken, getToken, setToken } from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  sendOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/api/auth/login", { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post("/api/auth/register", { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function loginWithGoogle(idToken: string) {
    const res = await api.post("/api/auth/google", { idToken });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function sendOtp(identifier: string) {
    await api.post("/api/auth/otp/send", { identifier });
  }

  async function verifyOtp(identifier: string, code: string) {
    const res = await api.post("/api/auth/otp/verify", { identifier, code });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, sendOtp, verifyOtp, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { apiErrorMessage };
