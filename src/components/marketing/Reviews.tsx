import { Star, BadgeCheck } from "lucide-react";

const REVIEWS = [
  {
    name: "Ritu Sharma",
    area: "Arera Colony, Bhopal",
    time: "12 min ago",
    text: "Cleaner reached on time and the kitchen looks brand new. ₹399 is honestly a steal.",
  },
  {
    name: "Aman Verma",
    area: "MP Nagar, Bhopal",
    time: "48 min ago",
    text: "Booked at 9 AM, staff assigned in 10 minutes. Great service and very professional.",
  },
  {
    name: "Sneha Patil",
    area: "Kolar Road, Bhopal",
    time: "2 hrs ago",
    text: "Very polite and well trained. Bathroom scrubbing was thorough. Will book weekly now.",
  },
  {
    name: "Devendra Rao",
    area: "Indrapuri, Bhopal",
    time: "3 hrs ago",
    text: "Transparent pricing is the best part. No haggling later, paid after the work.",
  },
];

export function Reviews() {
  return (
    <section className="border-t border-border bg-secondary/40 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Live reviews from Bhopal homes</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 4.9
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Updated as jobs complete today.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground/90">{r.text}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="flex items-center gap-1 text-xs font-bold">
                    {r.name} <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">{r.area}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}