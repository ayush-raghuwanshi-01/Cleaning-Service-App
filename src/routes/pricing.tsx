import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card, ErrorState } from "@/components/ui";
import { ServiceCardSkeleton } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { BRAND_CITY, BRAND_NAME } from "@/lib/config";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Cleaning Service Prices in ${BRAND_CITY} — ${BRAND_NAME}` },
      {
        name: "description",
        content: `Transparent starting prices for home cleaning, deep cleaning, housekeeping and car wash in ${BRAND_CITY}. Final price confirmed before work starts.`,
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
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
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Transparent pricing</h1>
        <ErrorState
          className="mt-8"
          title="Couldn't load prices"
          error={error}
          onRetry={() => refetch()}
        />
      </AppLayout>
    );
  }

  const live = (services ?? []).filter((s) => s.is_active);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Transparent pricing</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Starting prices for common services. The final price depends on the work and is agreed
        with you on a call before we start — no surprises.
      </p>

      {live.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-lg font-bold">Prices are being updated</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Our team can confirm any price on the phone in under a minute.
          </p>
          <Link to="/help" className="mt-5 inline-block">
            <Button variant="outline" size="lg">Contact us</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {live.map((s) => (
            <Card key={s.id} className="p-5 transition hover:border-primary/40 hover:shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-accent" /> {durationLabel(s.duration_minutes)}
                  </p>
                </div>
                <span className="text-lg font-extrabold text-primary">
                  {s.price_max ? `${inr(s.base_price)}–${inr(s.price_max)}` : inr(s.base_price)}
                </span>
              </div>
              {s.includes && (
                <ul className="mt-3 space-y-1.5">
                  {s.includes.slice(0, 4).map((i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {i}
                    </li>
                  ))}
                </ul>
              )}
              {(s.addon_price_30min ?? s.addon_price_60min) && (
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  Add-ons: {s.addon_price_30min ? `+30 min ${inr(s.addon_price_30min)}` : ""}
                  {s.addon_price_30min && s.addon_price_60min ? " · " : ""}
                  {s.addon_price_60min ? `+1 hr ${inr(s.addon_price_60min)}` : ""}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
