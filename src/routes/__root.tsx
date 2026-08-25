import type { QueryClient } from "@tanstack/react-query";
import { BRAND_CITY, BRAND_NAME } from "@/lib/config";
import { Outlet, Link, createRootRouteWithContext } from "@tanstack/react-router";

// Router context available to every route (via `Route.useRouteContext()` and
// `beforeLoad`). `auth` is provided by the AuthProvider bridge in main.tsx.
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: {
    user: import("@/types").User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (identifier: string, password: string) => Promise<import("@/types").User>;
    register: (payload: {
      full_name: string;
      phone: string;
      password: string;
    }) => Promise<import("@/types").User>;
    logout: () => void;
  };
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND_NAME} — Home Cleaning in ${BRAND_CITY} | Book in 2 Minutes` },
      {
        name: "description",
        content:
          `${BRAND_NAME} provides home cleaning, housekeeping, car wash and doorstep cleaning across ${BRAND_CITY}. ` +
          "Verified in-house staff, transparent pricing, pay after service. Book online in 2 minutes.",
      },
      { name: "theme-color", content: "#2576eb" },
      // Social sharing (Open Graph)
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:title", content: `${BRAND_NAME} — Home Cleaning in ${BRAND_CITY}` },
      {
        property: "og:description",
        content: "Home cleaning, housekeeping & car wash in Bhopal. Verified staff, clear prices, book in 2 minutes.",
      },
      { property: "og:image", content: "/favicon.svg" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      // Typography (Inter body / Plus Jakarta Sans display) and the icon are
      // also linked from index.html so they load before hydration; they are
      // listed here for full-URL renders (e.g. prerenders).
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  // Removed redundant QueryClientProvider — already in main.tsx
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          search={{ service: undefined, book: undefined }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
