import { Link } from "@tanstack/react-router";
import { BRAND_CITY, BRAND_NAME } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-semibold">
            {BRAND_CITY} home cleaning service
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-5xl">
            {BRAND_NAME}: clean homes, clear pricing
          </h1>
          <p className="mt-4 max-w-md text-base text-primary-foreground/90">
            Book housekeeping for selected Bhopal locations. Our verified, background-checked team confirms the scope, schedule and final amount before work starts.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/"
              search={{ service: undefined, book: true }}
              hash="book"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary"
            >
              Book a clean
            </Link>
            <Link
              to="/services"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              View services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
