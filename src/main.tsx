import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth } from "./lib/auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { OfflineBanner } from "./components/system/OfflineBanner";
import { ApiError, errorMessage, isSystemicError } from "./lib/api";
import { createLogger } from "./lib/logger";
import "./index.css";

const log = createLogger("query");

/**
 * Decide whether an error should surface as a global toast.
 *
 * Pages that render their own inline error state mark their query with
 * `meta: { silent: true }` to avoid double notifications.
 */
function shouldNotify(err: unknown, meta: unknown): boolean {
  if (meta && typeof meta === "object" && (meta as { silent?: boolean }).silent) {
    return false;
  }
  // 4xx responses are handled by the page that owns the query; only
  // systemic failures (offline / unreachable / 5xx) get a global toast so
  // users always know when the app can't reach the backend.
  return isSystemicError(err);
}

/**
 * Global server-state plumbing:
 *  - queries never auto-retry client errors (only one retry for systemic
 *    failures, which covers flaky connections),
 *  - systemic failures toast once, globally,
 *  - mutations without their own onError still get a visible toast —
 *    silent failures are not acceptable.
 */
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      log.warn(`query failed: ${String(query.queryKey[0])}`, error);
      if (shouldNotify(error, query.meta)) {
        // ToastProvider lives inside the app tree; global notifications go
        // through a tiny event so the provider can pick them up.
        window.dispatchEvent(
          new CustomEvent("app:error", {
            detail: {
              title: "Connection problem",
              description: errorMessage(
                error,
                "We couldn't reach the server. Your data is safe — please retry.",
              ),
            },
          }),
        );
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      log.error(`mutation failed: ${String(mutation.options.mutationKey ?? "anonymous")}`, error);
      if (mutation.meta?.silent) return;
      window.dispatchEvent(
        new CustomEvent("app:error", {
          detail: {
            title: "Action failed",
            description: errorMessage(
              error,
              "That didn't go through. Please check your connection and try again.",
            ),
          },
        }),
      );
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Never retry client errors — the same request will fail again.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: { retry: false },
  },
});

// The router is built once; auth + queryClient are provided into its context so
// routes can guard access and query in `beforeLoad`.
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined as never,
  },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Bridges live auth state into the router context after AuthProvider mounts.
function RouterBridge() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <OfflineBanner />
            <RouterBridge />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
