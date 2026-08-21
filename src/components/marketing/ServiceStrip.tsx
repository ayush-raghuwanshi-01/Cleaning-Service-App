import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { serviceImage } from "@/lib/service-images";
import { BRAND_CITY } from "@/lib/config";
import { ServiceGridSkeleton } from "@/components/ui/Skeleton";

export function ServiceStrip() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const featured = (services ?? []).filter((s) => s.is_active).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14" id="services">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Our services
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Popular in {BRAND_CITY}
          </h2>
        </div>
        <Link
          to="/services"
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ServiceGridSkeleton count={6} />
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm font-semibold">Our service menu is being updated</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Call us and we'll book you in right away.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <Link
                key={s.id}
                to="/services/$serviceId"
                params={{ serviceId: s.id }}
                className="group"
              >
                <article className="h-full overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lift">
                  <div className="h-36 w-full overflow-hidden">
                    <img
                      src={serviceImage(s.id)}
                      alt={s.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold">{s.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {durationLabel(s.duration_minutes)}
                    </p>
                    <p className="mt-2.5 text-sm font-extrabold text-primary">
                      from {inr(s.base_price)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
