import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth } from "./lib/auth";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterBridge />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
