import axios from "axios";

/**
 * In production the site and the API are served from the same domain
 * (Vercel routes /api/* to the serverless function), so requests use relative
 * URLs. VITE_API_URL is only needed for local dev against a separate API port.
 */
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

export const api = axios.create({ baseURL: API_URL, timeout: 30000 });

const TOKEN_KEY = "bg_token";

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return safeStorage()?.getItem(TOKEN_KEY) ?? null;
}

export function setToken(token: string) {
  safeStorage()?.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  safeStorage()?.removeItem(TOKEN_KEY);
}

/** Removes credentials older versions of the site stored in the browser (including plain-text passwords). */
export function purgeLegacyBrowserData() {
  const store = safeStorage();
  if (!store) return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key) continue;
      if (
        key.startsWith("bg_pwd_") ||
        key.startsWith("bg_auth_hash_") ||
        key.startsWith("bg_client_user_") ||
        key === "bg_staff_users" ||
        key === "bg_removed_staff_identifiers" ||
        key === "bg_client_visa_applications"
      ) {
        doomed.push(key);
      }
    }
    doomed.forEach((k) => store.removeItem(k));
    const token = store.getItem(TOKEN_KEY);
    // Old fake tokens (not real JWTs) — drop them so the user signs in properly.
    if (token && token.split(".").length !== 3) store.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

/** Pulls the API's { message } out of an axios error, with a sensible fallback. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Can't reach the server right now. Please check your connection and try again.";
    return err.response.data?.message ?? fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
