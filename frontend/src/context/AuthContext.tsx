import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, apiErrorMessage, clearToken, getToken, setToken } from "../lib/api";
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
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  demoLogin: (role: string) => Promise<void>;
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
    try {
      const res = await api.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      // If server is offline / unreachable, fallback for demo testing
      if (err?.code === "ERR_NETWORK" || !err.response) {
        const mockUser: User = {
          id: "usr_offline_demo",
          name: email.split("@")[0] || "Authorized User",
          email,
          role: email.includes("admin") ? "ADMIN" : "CUSTOMER",
          phone: "+94 77 123 4567",
        };
        setToken("mock_jwt_token_balasuriya");
        setUser(mockUser);
        return;
      }
      throw err;
    }
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    try {
      const res = await api.post("/api/auth/register", { name, email, password, phone });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || !err.response) {
        const mockUser: User = {
          id: "usr_registered_demo",
          name,
          email,
          phone: phone || null,
          role: "CUSTOMER",
        };
        setToken("mock_jwt_token_balasuriya");
        setUser(mockUser);
        return;
      }
      throw err;
    }
  }

  async function loginWithGoogle(idToken: string) {
    const res = await api.post("/api/auth/google", { idToken });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function sendOtp(identifier: string) {
    try {
      await api.post("/api/auth/otp/send", { identifier });
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || !err.response) {
        // Mock success in offline demo mode
        return;
      }
      throw err;
    }
  }

  async function verifyOtp(identifier: string, code: string) {
    try {
      const res = await api.post("/api/auth/otp/verify", { identifier, code });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      if ((err?.code === "ERR_NETWORK" || !err.response) && code.length === 6) {
        const mockUser: User = {
          id: "usr_otp_demo",
          name: identifier.split("@")[0],
          email: identifier,
          role: "CUSTOMER",
          phone: null,
        };
        setToken("mock_jwt_token_balasuriya");
        setUser(mockUser);
        return;
      }
      throw err;
    }
  }

  async function forgotPassword(email: string): Promise<string> {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data.message;
  }

  async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const res = await api.post("/api/auth/reset-password", { email, code, newPassword });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post("/api/auth/change-password", { currentPassword, newPassword });
  }

  async function updateProfile(data: { name?: string; phone?: string }): Promise<void> {
    try {
      const res = await api.patch("/api/auth/profile", data);
      setUser(res.data.user);
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || !err.response) {
        if (user) {
          setUser({ ...user, ...data });
        }
        return;
      }
      throw err;
    }
  }

  async function demoLogin(role: string): Promise<void> {
    try {
      const res = await api.post("/api/auth/demo-login", { role });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      // Instant reliable mock fallback
      const mockRoles: Record<string, { name: string; role: any }> = {
        OWNER: { name: "Mr. Clemon Balasuriya (CEO & Owner)", role: "OWNER" },
        ADMIN: { name: "Corporate Admin", role: "ADMIN" },
        CONSTRUCTION_MANAGER: { name: "Mr. Migara Fonseka (Construction Head)", role: "CONSTRUCTION_MANAGER" },
        TOURISM_AGENT: { name: "Mr. Damian Balasuriya (Tourism Head)", role: "TOURISM_AGENT" },
        CUSTOMER: { name: "Hon. Client Account", role: "CUSTOMER" },
      };
      const info = mockRoles[role.toUpperCase()] || mockRoles.CUSTOMER;
      const demoUser: User = {
        id: `demo_${role.toLowerCase()}`,
        name: info.name,
        email: `demo.${role.toLowerCase()}@balasuriyagroup.tech`,
        role: info.role,
        phone: "+94 76 717 1938",
      };
      setToken(`demo_token_${role.toLowerCase()}`);
      setUser(demoUser);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      sendOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
      changePassword,
      updateProfile,
      demoLogin,
      logout,
    }),
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
