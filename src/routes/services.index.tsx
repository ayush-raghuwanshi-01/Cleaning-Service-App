import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";
import { useOps } from "@/lib/ops-store";
import { CATEGORY_LABEL, durationLabel, priceLabel, type ServiceCategory } from "@/lib/booking";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Home Cleaning Services & Prices in Bhopal | SparkleHome" },
      {
        name: "description",
        content:
          "Browse SparkleHome Bhopal services: bathroom cleaning, kitchen cleaning, 1BHK maintenance and deep home cleaning with fixed prices and duration.",
      },
      { property: "og:title", content: "Home Cleaning Services & Prices in Bhopal | SparkleHome" },
      {
        property: "og:description",
        content: "Fixed-scope cleaning services in Bhopal with clear inclusions, timing and pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const ORDER: ServiceCategory[] = ["express", "packages", "addons"];

function ServicesPage() {
  const { services } = useOps();
  const live = services.filter((s) => s.active);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Our cleaning services</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Fixed scope, clear pricing and trained local staff. Final price depends on room size and
          dirt level — confirmed on WhatsApp before we start.
        </p>

        {ORDER.map((cat) => {
          const list = live.filter((s) => s.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} className="mt-10">
              <h2 className="font-display text-xl font-bold">{CATEGORY_LABEL[cat]}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {list.map((s) => (
                  <Link
                    key={s.id}
                    to="/services/$serviceId"
                    params={{ serviceId: s.id }}
                    className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold">{s.name}</h3>
                      <span className="shrink-0 text-sm font-extrabold text-primary">
                        {priceLabel(s)}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-accent">
                      <Clock className="h-3.5 w-3.5" /> {durationLabel(s.durationMins)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{s.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                      View details <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
