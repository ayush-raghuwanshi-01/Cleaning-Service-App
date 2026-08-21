import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { BRAND_CITY, BRAND_NAME } from "@/lib/config";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Cleaning Service Prices in Bhopal — ${BRAND_NAME}` },
      {
        name: "description",
        content: `Transparent starting prices for home cleaning, deep cleaning, housekeeping and car wash in ${BRAND_CITY}. Final price confirmed before work starts.`,
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const live = services.filter((s) => s.is_active);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Transparent pricing</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Starting prices for common services. The final price depends on the work and is agreed
        with you on a call before we start — no surprises.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {live.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockInline /> {durationLabel(s.duration_minutes)}
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
    </AppLayout>
  );
}

function ClockInline() {
  // small inline clock icon to avoid extra import churn in list
  return <span className="inline-block h-3.5 w-3.5 rounded-full border border-accent" />;
}
