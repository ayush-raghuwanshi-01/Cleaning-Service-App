import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { BRAND_CITY, BRAND_NAME, SUPPORT_PHONE, formatPhone } from "@/lib/config";

export function Header() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & City Badge */}
        <Link 
          to="/" 
          search={{ service: undefined, book: undefined }} 
          className="group flex min-w-0 items-center gap-3 transition-transform duration-200 active:scale-95"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/30">
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {BRAND_NAME}
            </span>
          </div>
        </Link>

        {/* Floating Center Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1.5 backdrop-blur-sm md:flex">
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
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white hover:text-blue-600 hover:shadow-sm [&.active]:bg-white [&.active]:text-blue-600 [&.active]:shadow-sm"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions Container */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="hidden rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 lg:inline-flex"
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/orders" 
                className="hidden rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 lg:inline-flex"
              >
                My Orders
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.full_name?.split(" ")[0]}</span>
              </Button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              Log in
            </Link>
          )}


          {/* Book Action Button */}
          <Link
            to="/"
            search={{ service: undefined, book: true }}
            hash="book"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
          >
            <span>Book Now</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}