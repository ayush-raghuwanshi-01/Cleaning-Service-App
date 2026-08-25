import { API_BASE_URL } from "./config";
import { createLogger } from "./logger";

/**
 * Thin, typed HTTP client around `fetch`.
 *
 * Handles JSON serialization, auth headers, automatic token refresh on 401,
 * request timeouts, offline detection, and normalized, user-friendly error
 * messages so the rest of the app can call API functions without worrying
 * about transport.
 */

const log = createLogger("api");

const TOKEN_KEY = "sparklehome.access_token";
const REFRESH_TOKEN_KEY = "sparklehome.refresh_token";

/** Hard cap per request — a stuck request must never hang the UI forever. */
const REQUEST_TIMEOUT_MS = 20_000;

export function getAccessToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Machine-readable failure kinds, so UI can react precisely. */
export type ApiErrorCode =
  | "offline"
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "server"
  | "unknown";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(status: number, message: string, code?: ApiErrorCode) {
    super(message);
    this.status = status;
    this.code = code ?? codeForStatus(status);
    this.name = "ApiError";
  }
}

function codeForStatus(status: number): ApiErrorCode {
  if (status === 0) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

/**
 * Best-effort human message for an HTTP status. Used when the backend's
 * `detail` is missing or not a plain string.
 */
function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "That request wasn't valid. Please check the details and try again.";
    case 401:
      return "Please log in and try again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "This already exists — please review and try again.";
    case 422:
      return "Some details need correcting. Please check the highlighted fields.";
    case 429:
      return "Too many attempts in a short time. Please wait a minute and try again.";
    default:
      if (status >= 500)
        return "Our server hit a snag. We're on it — please try again in a moment.";
      return `Request failed (${status}). Please try again.`;
  }
}

/** True when the failure is systemic (offline / backend unreachable / 5xx). */
export function isSystemicError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return (
    err.code === "offline" ||
    err.code === "network" ||
    err.code === "timeout" ||
    err.code === "server"
  );
}

interface RequestOptions {
  method?: string;
  /** JSON body. */
  body?: unknown;
  /** Raw form/other body; overrides `body`. */
  rawBody?: BodyInit;
  headers?: Record<string, string>;
  /** Per-request timeout override (ms). */
  timeoutMs?: number;
}

/**
 * Exchange the stored refresh token for a fresh access token.
 * Returns true on success; clears tokens if the refresh token is invalid.
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      REQUEST_TIMEOUT_MS,
    );
    if (!response.ok) {
      // Refresh token is dead — the user must log in again.
      clearTokens();
      return false;
    }
    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return true;
  } catch (err) {
    log.warn("token refresh failed", err);
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Normalize any thrown value into a user-friendly ApiError. */
function toTransportError(err: unknown): ApiError {
  if (err instanceof DOMException && err.name === "AbortError") {
    return new ApiError(0, "The request took too long. Please try again.", "timeout");
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new ApiError(
      0,
      "You appear to be offline. Check your connection and try again.",
      "offline",
    );
  }
  return new ApiError(
    0,
    "We couldn't reach Home Shine. Please check your connection and try again.",
    "network",
  );
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { method = "GET", body, rawBody, headers, timeoutMs } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  const token = getAccessToken();
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  let requestBody: BodyInit | undefined;
  if (rawBody) {
    requestBody = rawBody;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_BASE_URL}${path}`,
      {
        method,
        headers: requestHeaders,
        body: requestBody,
      },
      timeoutMs ?? REQUEST_TIMEOUT_MS,
    );
  } catch (err) {
    const apiErr = toTransportError(err);
    log.warn(`${method} ${path} → transport error`, apiErr);
    throw apiErr;
  }

  // Access token expired mid-session: refresh once and retry the request.
  // Never retry the auth endpoints themselves (avoids refresh loops).
  if (
    response.status === 401 &&
    !isRetry &&
    !path.startsWith("/api/v1/auth/")
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, true);
    }
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = (data as { detail?: unknown } | null)?.detail;
    let message: string;
    if (typeof detail === "string" && detail.trim()) {
      message = detail;
    } else if (Array.isArray(detail)) {
      // FastAPI 422 validation payload → readable one-liner.
      message = detail
        .map((d) => {
          const loc = Array.isArray((d as { loc?: unknown[] }).loc)
            ? ((d as { loc: unknown[] }).loc.filter((p) => p !== "body").join("."))
            : "";
          const msg = typeof (d as { msg?: unknown }).msg === "string" ? (d as { msg: string }).msg : "";
          return loc ? `${loc}: ${msg}` : msg;
        })
        .filter(Boolean)
        .join(" · ");
      message = message || messageForStatus(response.status);
    } else {
      message = messageForStatus(response.status);
    }
    if (response.status >= 500 || response.status === 0) {
      log.error(`${method} ${path} → ${response.status}`, { detail: data });
    } else {
      log.warn(`${method} ${path} → ${response.status}`, { detail: data });
    }
    throw new ApiError(response.status, message);
  }

  return data as T;
}

/** If a request returns 401, the stored token is stale — clear it. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

/**
 * Short, human copy for any caught error — for toasts and inline messages.
 * Falls back to a generic, non-technical sentence instead of dumping raw
 * error objects.
 */
export function errorMessage(err: unknown, fallback = "Something didn't work. Please try again."): string {
  if (err instanceof ApiError && err.message) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
