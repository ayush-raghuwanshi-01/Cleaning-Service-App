import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { BRAND_CITY, BRAND_NAME, SUPPORT_PHONE, formatPhone } from "@/lib/config";

export function Header() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
        <Link to="/" search={{ service: undefined, book: undefined }} className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold">{BRAND_NAME}</span>
            <span className="block text-[11px] font-medium text-muted-foreground">{BRAND_CITY}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="mr-1 hidden items-center gap-1 md:flex">
            {(
              [
                ["/services", "Services"],
                ["/pricing", "Pricing"],
                ["/help", "Help"],
                ["/track", "Track"],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground [&.active]:text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex">
                  Dashboard
                </Link>
              )}
              <Link to="/orders" className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex">
                My Orders
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
              </Button>
            </>
          ) : (
            <Link to="/login" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
              Log in
            </Link>
          )}

          <a
            href={SUPPORT_PHONE ? `tel:+${SUPPORT_PHONE}` : undefined}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground sm:inline-flex"
          >
            <Phone className="h-4 w-4" /> {formatPhone(SUPPORT_PHONE)}
          </a>

          <Link
            to="/"
            search={{ service: undefined, book: true }}
            hash="book"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}
