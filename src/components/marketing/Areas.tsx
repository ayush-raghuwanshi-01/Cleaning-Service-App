import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { fetchServiceAreas } from "@/lib/services-api";

export function Areas() {
  const { data: areas = [] } = useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });
  const active = areas.filter((a) => a.is_active);

  return (
    <section className="border-t border-border bg-secondary/40 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Bhopal areas we cover</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Serving all major areas in Bhopal. Most bookings are assigned within 15 minutes.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {active.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 shadow-[var(--shadow-card)]"
            >
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-bold leading-tight">{a.name}</p>
                <p className="text-[11px] text-muted-foreground">{a.pincode}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}