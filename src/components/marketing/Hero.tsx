import { Link } from "@tanstack/react-router";
import { Star, ShieldCheck, Clock, BadgeCheck } from "lucide-react";
import heroTeam from "@/assets/hero-team.jpg";
import heroCleaner from "@/assets/hero-cleaner.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-background to-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> Serving all of Bhopal
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-foreground md:text-[2.9rem]">
            Professional 2-Hour Home Cleaning at{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ₹399
            </span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Verified, trained staff at your door with their own supplies. We call you, confirm the
            details, and collect payment after the work — no hidden charges.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/"
              search={{ service: undefined, book: true }}
              hash="book"
              className="rounded-full bg-[image:var(--gradient-cta)] px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
            >
              Book for ₹399
            </Link>
            <Link
              to="/services"
              className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground"
            >
              View services
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                4.9 · <span className="font-medium text-muted-foreground">52,400+ ratings</span>
              </p>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> 2 hours fixed duration
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BadgeCheck className="h-4 w-4 text-accent" /> Verified, police-checked
            </div>
          </div>
        </div>

        {/* Hero images */}
        <div className="relative hidden md:block">
          <div className="grid grid-cols-2 gap-3">
            <img
              src={heroTeam}
              alt="SparkleHome team deep cleaning a Bhopal apartment"
              className="h-72 w-full rounded-2xl object-cover shadow-[var(--shadow-float)]"
            />
            <div className="space-y-3">
              <img
                src={heroCleaner}
                alt="Verified cleaner wiping a surface in a Bhopal home"
                className="h-40 w-full rounded-2xl object-cover shadow-[var(--shadow-card)]"
              />
              <div className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Full team deep clean
                </p>
                <p className="mt-1 font-display text-sm font-bold">4 trained pros · own supplies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}