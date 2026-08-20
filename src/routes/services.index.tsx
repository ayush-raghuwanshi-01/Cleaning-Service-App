import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
});

const CATEGORY_ORDER = ["express", "packages", "addons"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

function ServicesPage() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const live = services.filter((s) => s.is_active);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Our cleaning services</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Fixed scope and clear starting prices. Final price depends on the work and is confirmed before service starts.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const list = live.filter((s) => s.category === cat);
        if (!list.length) return null;
        return (
          <section key={cat} className="mt-10">
            <h2 className="font-display text-xl font-bold">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {list.map((s) => (
                <Link key={s.id} to="/services/$serviceId" params={{ serviceId: s.id }}>
                  <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/60">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold">{s.name}</h3>
                      <span className="shrink-0 text-sm font-extrabold text-primary">
                        {s.price_max ? `${inr(s.base_price)}–${inr(s.price_max)}` : inr(s.base_price)}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-accent">
                      <Clock className="h-3.5 w-3.5" /> {durationLabel(s.duration_minutes)}
                    </p>
                    {s.blurb && <p className="mt-2 text-xs text-muted-foreground">{s.blurb}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                      View details <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </AppLayout>
  );
}
