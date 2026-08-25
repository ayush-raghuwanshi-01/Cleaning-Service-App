import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, LogOut, ChevronRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/config";

const NAV_LINKS = [
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
  { to: "/track", label: "Track" },
] as const;

const linkBase =
  "rounded-full px-4 py-1.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white hover:text-brand-700 hover:shadow-sm [&.active]:bg-white [&.active]:text-brand-700 [&.active]:shadow-sm";

export function Header() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on Escape, and whenever the viewport grows past it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand logo */}
        <Link
          to="/"
          search={{ service: undefined, book: undefined }}
          className="group flex min-w-0 items-center gap-3 transition-transform duration-200 active:scale-95"
          aria-label={`${BRAND_NAME} home`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-brand-600/30">
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          </span>
          <span className="truncate font-display text-2xl font-extrabold tracking-tight text-slate-900">
            {BRAND_NAME}
          </span>
        </Link>

        {/* Floating centre navigation (desktop) */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1.5 backdrop-blur-sm md:flex" aria-label="Main">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={linkBase}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 lg:inline-flex"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              )}
              <Link
                to="/orders"
                className="hidden rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 lg:inline-flex"
              >
                My Orders
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                aria-label={`Log out of ${user?.full_name?.split(" ")[0] ?? "your account"}`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              Log in
            </Link>
          )}

          {/* Primary CTA */}
          <Link
            to="/"
            search={{ service: undefined, book: true }}
            hash="book"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-95"
          >
            <span>Book Now</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main (mobile)"
          className="border-t border-slate-200/80 bg-white px-4 pb-4 pt-2 md:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 [&.active]:bg-brand-50 [&.active]:text-brand-700"
                >
                  {label}
                </Link>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <Link
                  to="/orders"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 [&.active]:bg-brand-50 [&.active]:text-brand-700"
                >
                  My Orders
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 [&.active]:bg-brand-50 [&.active]:text-brand-700"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
