import { API_BASE_URL } from "./config";

/**
 * Thin, typed HTTP client around `fetch`.
 *
 * Handles JSON serialization, auth headers, and normalized error responses so
 * the rest of the app can call API functions without worrying about transport.
 */

const TOKEN_KEY = "sparklehome.access_token";
const REFRESH_TOKEN_KEY = "sparklehome.refresh_token";

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

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: string;
  /** JSON body. */
  body?: unknown;
  /** Raw form/other body; overrides `body`. */
  rawBody?: BodyInit;
  headers?: Record<string, string>;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, rawBody, headers } = options;

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
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch {
    throw new ApiError(
      0,
      "Network error. Please check your connection and try again.",
    );
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
    const detail =
      (data as { detail?: unknown } | null)?.detail ??
      `Request failed with status ${response.status}`;
    throw new ApiError(
      response.status,
      typeof detail === "string" ? detail : JSON.stringify(detail),
    );
  }

  return data as T;
}

/** If a request returns 401, the stored token is stale — clear it. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};