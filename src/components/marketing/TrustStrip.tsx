import { ShieldCheck, BadgeCheck, IndianRupee, Package } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Verified & Trained Staff", sub: "ID-checked, uniformed professionals" },
  { icon: ShieldCheck, title: "100% Satisfaction Guarantee", sub: "Free re-clean within 24 hours" },
  { icon: IndianRupee, title: "Transparent Pricing", sub: "Flat rates. No hidden charges" },
  { icon: Package, title: "Own Supplies", sub: "Eco-safe products, brought along" },
];

export function TrustStrip() {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}