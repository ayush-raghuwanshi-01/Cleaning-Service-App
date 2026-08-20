import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, clearTokens, getAccessToken, getRefreshToken, setTokens, setUnauthorizedHandler } from "./api";
import { toast } from "@/lib/toast";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (payload: {
    full_name: string;
    phone: string;
    password: string;
  }) => Promise<User>;
  updateProfile: (payload: { full_name?: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));

  // Restore the session from the stored token on first load.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return; // `loading` already starts false when there is no token
    api
      .get<User>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => {
        // If the initial access token is stale, a silent refresh + retry already
        // happened inside the client; only clear if we're truly unauthenticated.
        clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  // Global "session expired" handling — clear state and bounce to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      toast("Your session has expired. Please log in again.", "error");
      window.setTimeout(() => {
        window.location.assign("/login");
      }, 400);
    });
  }, []);

  async function login(identifier: string, password: string): Promise<User> {
    const res = await api.post<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/login",
      { identifier, password },
    );
    setTokens(res.access_token, res.refresh_token);
    const me = await api.get<User>("/api/v1/auth/me");
    setUser(me);
    return me;
  }

  async function loginWithGoogle(credential: string): Promise<User> {
    const res = await api.post<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/google",
      { credential },
    );
    setTokens(res.access_token, res.refresh_token);
    const me = await api.get<User>("/api/v1/auth/me");
    setUser(me);
    return me;
  }

  async function register(payload: {
    full_name: string;
    phone: string;
    password: string;
  }): Promise<User> {
    const me = await api.post<User>("/api/v1/auth/register", payload);
    return me;
  }

  async function updateProfile(payload: { full_name?: string; phone?: string }): Promise<User> {
    const me = await api.patch<User>("/api/v1/auth/me", payload);
    setUser(me);
    return me;
  }

  async function logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Best-effort server-side revocation; never block logout on failure.
      try {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      } catch {
        /* ignore */
      }
    }
    clearTokens();
    setUser(null);
  }

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user && ["OWNER", "ADMIN", "OPERATIONS"].includes(user.role));

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin, login, loginWithGoogle, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
