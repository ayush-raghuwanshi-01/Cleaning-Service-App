import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { Card } from "@/components/ui";

export function ServiceStrip() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const featured = services.filter((s) => s.is_active).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Popular services</h2>
        <Link to="/services" className="text-sm font-semibold text-primary">
          View all →
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featured.map((s) => (
          <Link key={s.id} to="/services/$serviceId" params={{ serviceId: s.id }}>
            <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/60">
              <h3 className="font-bold">{s.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{durationLabel(s.duration_minutes)}</p>
              <p className="mt-3 text-sm font-extrabold text-primary">from {inr(s.base_price)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
