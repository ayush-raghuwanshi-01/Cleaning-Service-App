import { Star } from "lucide-react";

const REVIEWS = [
  { name: "Ritu Sharma", area: "Arera Colony", rating: 5, mins: 12, text: "Cleaner reached on time and the kitchen looks brand new. ₹399 is honestly a steal." },
  { name: "Aman Verma", area: "MP Nagar", rating: 5, mins: 48, text: "Booked at 9 AM, staff assigned in 10 minutes. Loved the live tracking with the 2-hour timer." },
  { name: "Sneha Patil", area: "Kolar Road", rating: 4, mins: 96, text: "Very polite and well trained. Bathroom scrubbing was thorough. Will book weekly now." },
  { name: "Devendra Rao", area: "Indrapuri", rating: 5, mins: 180, text: "Paid on PhonePe in seconds, no haggling later. Transparent pricing is the best part." },
];

function ago(mins: number) {
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return `${h} hr${h > 1 ? "s" : ""} ago`;
}

export function Reviews() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">Live reviews from Bhopal homes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Updated as jobs complete today.</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">
          4.9 average
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {REVIEWS.map((r) => (
          <article key={r.name} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.area}, Bhopal</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{ago(r.mins)}</span>
            </div>
            <div className="mt-3 flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < r.rating ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4 text-muted-foreground/40"
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground/85">{r.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
