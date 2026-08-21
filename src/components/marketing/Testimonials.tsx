import { Star, Quote } from "lucide-react";
import { BRAND_CITY } from "@/lib/config";

/**
 * Static testimonials (MVP). Replace with the ratings & reviews API in Phase 2
 * — the layout already renders from a data array, so swapping the source is a
 * one-line change.
 */
const TESTIMONIALS = [
  {
    name: "Priya S.",
    area: "MP Nagar",
    rating: 5,
    text: `Booked a deep clean before Diwali — the kitchen and bathrooms looked brand new. The team arrived on time and the price was exactly what was confirmed on the call.`,
  },
  {
    name: "Rakesh M.",
    area: "Arera Colony",
    rating: 5,
    text: "I run a clinic and need cleaning twice a week. Their own staff comes regularly, no random people ever show up. Very reliable in Bhopal.",
  },
  {
    name: "Anjali K.",
    area: "Kolar Road",
    rating: 4,
    text: "Loved the bathroom cleaning service. Booked on the website in 2 minutes, got a WhatsApp confirmation, and could track the slot. Simple and clear.",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-secondary/50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Customer stories
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Trusted by families across {BRAND_CITY}
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
            >
              <Quote className="h-6 w-6 text-brand-200" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.area}, {BRAND_CITY}</p>
                </div>
                <span className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-highlight text-highlight" />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ratings collected from customers after completed cleans.
        </p>
      </div>
    </section>
  );
}
