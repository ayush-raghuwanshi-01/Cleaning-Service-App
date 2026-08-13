import { MapPin } from "lucide-react";
import { useOps } from "@/lib/ops-store";

export function Areas() {
  const { areas } = useOps();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-display text-2xl font-bold md:text-3xl">Bhopal areas we cover</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Serving all major areas in Bhopal: MP Nagar, Arera Colony, Gulmohar, Kolar Road, Ayodhya
        Bypass, Hoshangabad Road & Old City. Most bookings are assigned within 15 minutes.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {areas.map((area) => (
          <li
            key={area.name}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${
              area.servicing
                ? "border-border bg-card"
                : "border-dashed border-border bg-muted text-muted-foreground line-through"
            }`}
          >
            <MapPin className={`h-3.5 w-3.5 ${area.servicing ? "text-accent" : ""}`} />
            {area.name}
            <span className="text-[11px] text-muted-foreground">{area.pincode}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
