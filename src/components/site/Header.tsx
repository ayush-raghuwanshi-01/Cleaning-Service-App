import { Link } from "@tanstack/react-router";
import { Sparkles, Phone } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/booking";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold">SparkleHome</span>
            <span className="block text-[11px] font-medium text-muted-foreground">Bhopal</span>
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
          <Link
            to="/admin"
            className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex"
          >
            Ops
          </Link>
          <Link
            to="/staff"
            className="hidden rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground lg:inline-flex"
          >
            Cleaner app
          </Link>
          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground sm:inline-flex"
          >
            <Phone className="h-4 w-4" /> +91 98765 43210
          </a>
          <a
            href="#book"
            className="rounded-full bg-[image:var(--gradient-cta)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)]"
          >
            Book ₹399
          </a>
        </div>
      </div>
    </header>
  );
}
