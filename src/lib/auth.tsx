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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore the session from the stored token on first load.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    restoreSession();
  }, []);

  // Periodic token refresh so the access token never goes stale mid-session.
  // (api.ts also auto-refreshes on any 401, so this is a belt-and-braces
  // measure that keeps requests from ever hitting a 401 in the first place.)
  useEffect(() => {
    if (user) {
      refreshTimer.current = setInterval(() => {
        attemptTokenRefresh().catch(() => {
          // Silent fail — api.ts will refresh on the next 401 anyway.
        });
      }, REFRESH_INTERVAL_MS);
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [user]);

  /**
   * Restore the session. `api.get("/auth/me")` already auto-refreshes the
   * access token once on 401 (see api.ts), so no manual refresh is needed
   * here — doing it twice would rotate/revoke the refresh token prematurely.
   */
  async function restoreSession() {
    try {
      const me = await api.get<User>("/api/v1/auth/me");
      setUser(me);
    } catch {
      // Token could not be restored or refreshed — require a fresh login.
      clearTokens();
    } finally {
      setLoading(false);
    }
  }

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

  async function login(
    identifier: string,
    password: string,
  ): Promise<User> {
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
    clearTokens();
    setUser(null);
  }

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