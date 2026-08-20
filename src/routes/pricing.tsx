import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, MessageCircle, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StickyBar } from "@/components/layout/StickyBar";
import { Button, Card } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const CATEGORY_ORDER = ["express", "packages", "addons"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

function PricingPage() {
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const live = services.filter((s) => s.is_active);

  return (
    <AppLayout>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Starting from ₹299
        </span>
      </div>
      <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Transparent pricing</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        No hidden charges, no surprise add-ons. You approve the price before the crew starts.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const list = live.filter((s) => s.category === cat);
        if (!list.length) return null;
        return (
          <section key={cat} className="mt-10">
            <h2 className="font-display text-xl font-bold">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {list.map((s) => (
                <Card key={s.id} className="p-5">
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
          </section>
        );
      })}

      {/* Trust + CTA */}
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold">Why customers trust us</h3>
          <ul className="mt-3 space-y-2">
            {[
              "Trained local staff, police verified",
              "Fixed scope and clear pricing",
              "WhatsApp booking & support",
              "Safety first: gloves, masks, safe chemicals",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-sm text-foreground/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-gradient-to-br from-primary-soft to-accent-soft p-6">
          <h3 className="font-bold">Note on final pricing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Final price depends on the work and is confirmed on a call before we start — you can
            cancel free of charge until then.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Get a quote
            </a>
            <Link to="/" search={{ service: undefined, book: true }} hash="book">
              <Button variant="outline">Book online</Button>
            </Link>
          </div>
        </Card>
      </div>

      <StickyBar />
    </AppLayout>
  );
}