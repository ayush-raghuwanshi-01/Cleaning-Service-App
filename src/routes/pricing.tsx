import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useOps } from "@/lib/ops-store";
import { CATEGORY_LABEL, durationLabel, priceLabel, type ServiceCategory } from "@/lib/booking";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Cleaning Prices in Bhopal - Starting ₹299 | SparkleHome" },
      {
        name: "description",
        content:
          "Transparent cleaning price list for Bhopal: bathroom from ₹449, kitchen ₹699, 1BHK maintenance ₹899-₹1,099 and monthly plans from ₹1,699.",
      },
      { property: "og:title", content: "Cleaning Prices in Bhopal - Starting ₹299 | SparkleHome" },
      {
        property: "og:description",
        content: "Fixed packages, no hidden charges. Final price confirmed on WhatsApp before work starts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const ORDER: ServiceCategory[] = ["express", "packages", "addons"];

function PricingPage() {
  const { services } = useOps();
  const live = services.filter((s) => s.active);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          Starting from ₹299 · Trial clean
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
          Transparent pricing for Bhopal homes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          No hidden charges, no surprise add-ons. You approve the price before the crew starts work.
        </p>

        {ORDER.map((cat) => {
          const list = live.filter((s) => s.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} className="mt-8">
              <h2 className="font-display text-lg font-bold">{CATEGORY_LABEL[cat]}</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                {list.map((s) => (
                  <Link
                    key={s.id}
                    to="/services/$serviceId"
                    params={{ serviceId: s.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3 last:border-b-0 hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {durationLabel(s.durationMins)} · {s.blurb}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-primary">
                      {priceLabel(s)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">Why customers trust us</h2>
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
          </div>
          <div className="rounded-2xl bg-secondary/60 p-5">
            <p className="text-sm font-bold">Note on final pricing</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Final price depends on room size and the level of dirt. We confirm the exact amount on
              WhatsApp before the crew starts — you can cancel free of charge until then.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <WhatsAppButton text="Get a quote" />
              <Link
                to="/"
                hash="book"
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
              >
                Book online
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
