import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getAccessToken, setAccessToken, isUnauthorized } from "./api";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));

  // Restore the session from the stored token on first load.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    api
      .get<User>("/api/v1/auth/me")
      .then(setUser)
      .catch((err) => {
        if (isUnauthorized(err)) setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier: string, password: string): Promise<User> {
    const res = await api.post<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/login",
      { identifier, password },
    );
    setAccessToken(res.access_token);
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
    setAccessToken(null);
    setUser(null);
  }

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user && ["OWNER", "ADMIN", "OPERATIONS"].includes(user.role));

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin, login, register, logout }}
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
