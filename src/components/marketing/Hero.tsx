import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, CheckCircle2, MessageCircle, Sparkles, Star } from "lucide-react";
import { BRAND_CITY, WHATSAPP_NUMBER } from "@/lib/config";
import { fetchServices } from "@/lib/services-api";
import { fetchServiceAreas } from "@/lib/services-api";
import { inr } from "@/lib/format";
import heroMain from "@/assets/hero-cleaner.jpg";
import heroTeam from "@/assets/hero-team.jpg";
import heroWork from "@/assets/after-kitchen.jpg";

const TRUST_BADGES = [
  "Verified & Trained Staff",
  "100% Satisfaction Guarantee",
  "Transparent Pricing",
];

/** Pastel avatar gradients — mostly green/amber, a touch of blue. */
const AVATAR_STYLES = [
  "from-fresh-400 to-fresh-600",
  "from-sun-400 to-sun-600",
  "from-brand-300 to-fresh-500",
  "from-fresh-300 to-fresh-600",
];

export function Hero() {
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const { data: areas } = useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });
  const startingPrice = (services ?? [])
    .filter((s) => s.is_active)
    .reduce((min, s) => Math.min(min, Number(s.base_price)), Infinity);
  const price = Number.isFinite(startingPrice) ? startingPrice : 299;
  const localityCount = (areas ?? []).filter((a) => a.is_active).length;

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-20">
      {/* Light, airy background: white → faint green wash + pastel orbs (no blue grid) */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-fresh-50/70 via-white to-white" />
      <div aria-hidden className="orb-sun top-8 -right-16" />
      <div aria-hidden className="orb-fresh bottom-0 -left-16" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* ---------- Left: copy + CTAs + proof ---------- */}
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fresh-200 bg-white/80 px-4 py-2 text-sm font-semibold text-fresh-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-fresh-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fresh-500" />
              </span>
              Now serving all of {BRAND_CITY}
              {localityCount > 0 ? ` · ${localityCount}+ localities` : ""}
            </div>
<div className="relative">
  <Sparkles
    aria-hidden
    className="absolute -top-5 -left-8 h-7 w-7 text-sun-400"
  />
  <h1 className="font-display text-4xl leading-[1.2] font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">

    <span className="relative inline-block  rounded-xl bg-fresh-100 px-2.5 py-0.5">Your Home Cleaning
    </span>
    <br />
    <span className="text-2xl font-bold text-ink-700 sm:text-3xl lg:text-4xl">
      by <span className="font-extrabold text-brand-600">Home Shine</span> is just
    </span>{" "}
    <span className="relative mt-1 inline-flex flex-col items-center">
      <span className="absolute  left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink-900 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.18em] text-white">
        FROM
      </span>
      <span className="inline-block -rotate-1 rounded-xl bg-sun-200 px-2 py-0.5 text-ink-900 shadow-lg shadow-sun-500/40 ">
        {inr(price)}
      </span>
    </span>
  </h1>
</div>
            <p className="mb-8 mt-2 max-w-xl text-lg leading-relaxed text-ink-500">
              Home cleaning, housekeeping & doorstep cleaning — trained,
              police-verified professionals at your doorstep. Book in 60 seconds and
              pay after the work is done.
            </p>

            <div className="mb-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/"
                search={{ service: undefined, book: true }}
                hash="book"
                className="group flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-600/40"
              >
                Book Cleaning @ {inr(price)}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi! I want to book a home cleaning service in ${BRAND_CITY}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-fresh-200 bg-white px-8 py-4 text-lg font-semibold text-fresh-700 transition-all hover:bg-fresh-50"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-fresh-500" />
                  <span className="font-medium">{badge}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 border-t border-fresh-100 pt-8">
              <div className="flex -space-x-3">
                {["P", "R", "A", "S"].map((initial, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-sm font-bold text-white shadow-md ${AVATAR_STYLES[i]}`}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-sun-500 text-sun-500" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-ink-900">4.9</span>
                </div>
                <p className="text-xs text-ink-500">Loved by families across {BRAND_CITY}</p>
              </div>
            </div>
          </div>

          {/* ---------- Right: photo collage + floating cards ---------- */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-fresh-200/50 via-sun-100/60 to-brand-100/40 opacity-70 blur-3xl"
              />

              <div className="relative grid grid-cols-12 gap-3">
                {/* Main image */}
                <div className="col-span-12 sm:col-span-8">
                  <div className="image-zoom relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-ink-900/15">
                    <img
                      src={heroMain}
                      alt={`Professional ${BRAND_CITY} cleaner at work`}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink-900/15 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="glass flex items-center gap-3 rounded-xl p-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-fresh-500">
                          <BadgeCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">Police Verified</p>
                          <p className="text-xs text-ink-500">Background-checked & uniformed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side images */}
                <div className="col-span-12 flex flex-col gap-3 sm:col-span-4">
                  <div className="image-zoom relative aspect-square overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={heroTeam}
                      alt="Our in-house cleaning team"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="image-zoom relative flex-1 overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={heroWork}
                      alt="Freshly deep-cleaned kitchen"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating offer card */}
              <div className="animate-float absolute -bottom-4 -left-2 z-20 rounded-2xl border border-sun-100 bg-white p-4 shadow-2xl sm:-left-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-sun-400 to-sun-600">
                    <Star className="h-6 w-6 fill-white text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink-500">Express Service</p>
                    <p className="font-display font-bold text-ink-900">2 Hours · {inr(price)}</p>
                  </div>
                </div>
              </div>

              {/* Floating rating badge */}
              <div className="animate-bounce-subtle absolute -top-2 -right-2 z-20 rounded-2xl border border-brand-50 bg-white p-3 shadow-2xl sm:-right-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-sun-500 text-sun-500" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-ink-900">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}