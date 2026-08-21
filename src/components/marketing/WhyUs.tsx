import { BadgeCheck, Clock, HandCoins, ShieldCheck, Sparkles, Users } from "lucide-react";
import { BRAND_CITY } from "@/lib/config";

const REASONS = [
  {
    icon: Users,
    title: "Our own trained team",
    body: `No contractors. Every cleaner in ${BRAND_CITY} is trained, background-checked and works directly for us.`,
  },
  {
    icon: Clock,
    title: "Same-day & next-day slots",
    body: "Book in under a minute. Morning and evening slots available 7 days a week.",
  },
  {
    icon: HandCoins,
    title: "Transparent pricing",
    body: "Clear starting prices, final amount confirmed before work starts. Pay by UPI or cash after the job.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & trusted",
    body: "Police-verified staff, professional supplies and a satisfaction re-clean promise.",
  },
  {
    icon: Sparkles,
    title: "Professional-grade clean",
    body: "Machine-scrubbed floors, bathroom descaling, kitchen degreasing — proper deep cleaning, not jhaadu-pocha.",
  },
  {
    icon: BadgeCheck,
    title: "Easy tracking & support",
    body: "Track your booking live by code, and reach a real human on call or WhatsApp anytime.",
  },
];

export function WhyUs() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" id="why-us">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Why choose us
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
          Bhopal's dependable home cleaning team
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We clean homes, shops, offices and clinics across {BRAND_CITY} — with
          the same in-house team on every job, so quality never changes.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
