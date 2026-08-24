import { ShieldCheck, Clock, IndianRupee, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, label: "Verified background" },
  { icon: Clock, label: "Experienced housekeeping" },
  { icon: IndianRupee, label: "Transparent pricing" },
  { icon: ShieldCheck, label: "Location-focused service" },
];

export function TrustStrip() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fresh-100 text-fresh-700">
              <Icon className="h-5 w-5" />
            </span>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}