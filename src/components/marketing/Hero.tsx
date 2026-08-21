import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, IndianRupee, Star } from "lucide-react";
import { BRAND_CITY, BRAND_NAME, SUPPORT_PHONE, formatPhone } from "@/lib/config";
import heroImg from "@/assets/hero-cleaner.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
      {/* Soft decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <BadgeCheck className="h-4 w-4" /> {BRAND_CITY}'s own cleaning team — no contractors
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] md:text-5xl">
            Home cleaning in {BRAND_CITY}, booked in 2 minutes
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">
            Home cleaning, housekeeping, car wash and doorstep cleaning —
            verified staff, clear prices, morning &amp; evening slots. Anywhere
            in {BRAND_CITY}.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/"
              search={{ service: undefined, book: true }}
              hash="book"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-800 shadow-lift transition hover:scale-[1.02] active:scale-95"
            >
              Book a clean — it's free
            </Link>
            <a
              href={`tel:+${SUPPORT_PHONE}`}
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/10"
            >
              📞 {formatPhone(SUPPORT_PHONE)}
            </a>
          </div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-white/70"><Star className="h-4 w-4" /> Rated</dt>
              <dd className="mt-1 font-display text-xl font-extrabold">4.8★</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-white/70"><Clock className="h-4 w-4" /> Slots</dt>
              <dd className="mt-1 font-display text-xl font-extrabold">8 AM–8 PM</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-white/70"><IndianRupee className="h-4 w-4" /> Starting</dt>
              <dd className="mt-1 font-display text-xl font-extrabold">₹199</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden md:block">
          <div className="overflow-hidden rounded-3xl border-4 border-white/20 shadow-lift">
            <img
              src={heroImg}
              alt={`${BRAND_NAME} cleaning professional at work in ${BRAND_CITY}`}
              loading="eager"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 text-foreground shadow-lift">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Police-verified staff</p>
              <p className="text-xs text-muted-foreground">Trained • {BRAND_CITY} based</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
