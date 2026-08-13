import {
  BadgeCheck,
  Fingerprint,
  HeartHandshake,
  IndianRupee,
  ShieldCheck,
  Shirt,
  Sparkles,
  UserCheck,
} from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, title: "Verified & Trained Staff", desc: "ID-checked, uniformed professionals" },
  { icon: HeartHandshake, title: "100% Satisfaction Guarantee", desc: "Free re-clean within 24 hours" },
  { icon: IndianRupee, title: "Transparent Pricing", desc: "Flat rates. No hidden charges" },
  { icon: Sparkles, title: "Own Supplies", desc: "Eco-safe products, brought along" },
];

const SAFETY = [
  { icon: ShieldCheck, label: "Police Verified Staff" },
  { icon: Fingerprint, label: "Background Checked" },
  { icon: Shirt, label: "Uniformed & Trained" },
  { icon: UserCheck, label: "Live Tracked Jobs" },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-bold">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {SAFETY.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent"
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
