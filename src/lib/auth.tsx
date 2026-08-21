import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  api,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
} from "./api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: {
    full_name: string;
    phone: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // Keep tokens fresh every 10 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  // `loading` starts true only when a token exists, so the no-token path never
  // needs a synchronous setState inside the mount effect.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function attemptTokenRefresh(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const res = await api.post<{
      access_token: string;
      refresh_token: string;
    }>("/api/v1/auth/refresh", { refresh_token: refreshToken });

    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
  }

  async function login(identifier: string, password: string): Promise<User> {
    const res = await api.post<{
      access_token: string;
      refresh_token: string;
    }>("/api/v1/auth/login", { identifier, password });
    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
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

  function logout() {
    // Best-effort revocation of the refresh token (ignore failures — tokens
    // are cleared locally regardless).
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      api.post("/api/v1/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    clearTokens();
    setUser(null);
  }

  // Restore the session from the stored token on first load.
  // `api.get("/auth/me")` auto-refreshes the access token once on 401.
  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await api.get<User>("/api/v1/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Periodic token refresh so the access token never goes stale mid-session.
  useEffect(() => {
    if (!user) return;
    refreshTimer.current = setInterval(() => {
      attemptTokenRefresh().catch(() => {
        // Silent fail — api.ts will refresh on the next 401 anyway.
      });
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [user]);

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(
    user && ["OWNER", "ADMIN", "OPERATIONS"].includes(user.role),
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
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
