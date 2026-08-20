import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      { title: `${BRAND_NAME} — Home Cleaning${BRAND_CITY ? ` in ${BRAND_CITY}` : ""}` },
      {
        name: "description",
        content:
          `Book home cleaning services${BRAND_CITY ? ` in ${BRAND_CITY}` : ""}. Browse services, request a slot and track your order online.`,
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap",
      },
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
