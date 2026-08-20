import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { fetchServiceAreas } from "@/lib/services-api";
import { FALLBACK_SERVICE_AREAS } from "@/lib/config";

export function Areas() {
  const { data: areas = [] } = useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });
  const liveAreas = areas.filter((a) => a.is_active);

  return (
    <section className="border-t border-border bg-secondary/40 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-bold">Areas we serve</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {liveAreas.length > 0
            ? liveAreas.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {a.name}
                </span>
              ))
            : FALLBACK_SERVICE_AREAS.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {area}
                </span>
              ))}
        </div>
      </div>
    </section>
  );
}
