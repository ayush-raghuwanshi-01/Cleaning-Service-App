import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight, PhoneCall } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, ErrorState, ServiceGridSkeleton } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { BRAND_CITY, BRAND_NAME, SUPPORT_PHONE, formatPhone } from "@/lib/config";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: `Cleaning Services in ${BRAND_CITY} — ${BRAND_NAME}` },
      {
        name: "description",
        content: `Browse home cleaning, deep cleaning, housekeeping and car wash services in ${BRAND_CITY} with transparent starting prices.`,
      },
    ],
  }),
  component: ServicesPage,
});

const CATEGORY_ORDER = ["express", "packages", "addons"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

function ServicesPage() {
  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    meta: { silent: true },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-9 w-72 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-secondary" />
        <div className="mt-8"><ServiceGridSkeleton count={6} /></div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Our cleaning services</h1>
        <ErrorState
          className="mt-8"
          title="Couldn't load our services"
          error={error}
          onRetry={() => refetch()}
        />
      </AppLayout>
    );
  }

  const live = (services ?? []).filter((s) => s.is_active);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Our cleaning services</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Fixed scope and clear starting prices. Final price depends on the work and is confirmed before service starts.
      </p>

      {live.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-primary">
            <PhoneCall className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-bold">Our service menu is being updated</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            We're refreshing our catalogue. Call us on{" "}
            <a href={`tel:+${SUPPORT_PHONE}`} className="font-semibold text-primary hover:underline">
              {formatPhone(SUPPORT_PHONE)}
            </a>{" "}
            and we'll book you in right away.
          </p>
        </div>
      ) : (
        CATEGORY_ORDER.map((cat) => {
          const list = live.filter((s) => s.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} className="mt-10 first:mt-8">
              <h2 className="font-display text-xl font-bold">{CATEGORY_LABEL[cat] ?? cat}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {list.map((s) => (
                  <Link key={s.id} to="/services/$serviceId" params={{ serviceId: s.id }}>
                    <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lift">
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
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary transition group-hover:gap-1.5">
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </AppLayout>
  );
}
