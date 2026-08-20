import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function Header() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
        <Link to="/" search={{ service: undefined, book: undefined }} className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold">SparkleHome</span>
            <span className="block text-[11px] font-medium text-muted-foreground">Bhopal · 2-hr cleaning</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="mr-1 hidden items-center gap-1 md:flex">
            {(
              [
                ["/services", "Services"],
                ["/pricing", "Pricing"],
                ["/help", "Help"],
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
                <Link
                  to="/admin"
                  className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              )}
              <Link
                to="/orders"
                className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex"
              >
                My Orders
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground" aria-label="Log out">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground sm:inline-flex"
            >
              Log in
            </Link>
          )}

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent lg:inline-flex"
          >
            <Phone className="h-4 w-4" /> WhatsApp
          </a>

          <Link
            to="/"
            search={{ service: undefined, book: true }}
            hash="book"
            className="rounded-full bg-[image:var(--gradient-cta)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)]"
          >
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}