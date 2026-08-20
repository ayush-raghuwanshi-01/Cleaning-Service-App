import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight } from "lucide-react";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { serviceImage } from "@/lib/service-images";

export function ServiceStrip() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const live = services.filter((s) => s.is_active);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Our cleaning services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fixed scope, clear pricing and trained local staff.
          </p>
        </div>
        <Link to="/services" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {live.slice(0, 6).map((s) => (
          <Link
            key={s.id}
            to="/services/$serviceId"
            params={{ serviceId: s.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-float)]"
          >
            <div className="h-40 w-full overflow-hidden">
              <img
                src={serviceImage(s.id)}
                alt={s.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold">{s.name}</h3>
                <span className="shrink-0 text-sm font-extrabold text-primary">
                  {s.price_max ? `${inr(s.base_price)}–${inr(s.price_max)}` : inr(s.base_price)}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-accent" /> {durationLabel(s.duration_minutes)}
              </p>
              {s.blurb && <p className="mt-2 text-xs text-muted-foreground">{s.blurb}</p>}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/services" className="text-sm font-semibold text-primary">
          View all services →
        </Link>
      </div>
    </section>
  );
}