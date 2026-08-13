import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useOps } from "@/lib/ops-store";
import { durationLabel, priceLabel, serviceExclusions } from "@/lib/booking";
import beforeImg from "@/assets/before-kitchen.jpg";
import afterImg from "@/assets/after-kitchen.jpg";

export const Route = createFileRoute("/services/$serviceId")({
  head: () => ({
    meta: [
      { title: "Service details & inclusions | SparkleHome Bhopal" },
      {
        name: "description",
        content:
          "See exactly what is included and excluded, how long it takes and what it costs before you book your Bhopal home cleaning.",
      },
      { property: "og:title", content: "Service details & inclusions | SparkleHome Bhopal" },
      {
        property: "og:description",
        content: "Inclusions, exclusions, duration and pricing for SparkleHome Bhopal cleaning services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { serviceId } = Route.useParams();
  const { services } = useOps();
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Link to="/services" className="mt-6 inline-block text-sm font-bold text-primary">
            Browse all services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/services" className="text-xs font-semibold text-muted-foreground">
          ← All services
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{service.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary">
            {priceLabel(service)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
            <Clock className="h-3.5 w-3.5" /> {durationLabel(service.durationMins)}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{service.blurb}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">What's included</h2>
            <ul className="mt-3 space-y-2">
              {service.includes.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">Not included</h2>
            <ul className="mt-3 space-y-2">
              {serviceExclusions(service).map((i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { src: beforeImg, label: "Before", alt: `Bhopal home before ${service.name}` },
            { src: afterImg, label: "After", alt: `Bhopal home after ${service.name}` },
          ].map((img) => (
            <figure key={img.label} className="overflow-hidden rounded-2xl border border-border">
              <img src={img.src} alt={img.alt} loading="lazy" className="h-56 w-full object-cover" />
              <figcaption className="bg-secondary/60 px-4 py-2 text-xs font-bold">
                {img.label}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            search={{ service: service.id }}
            hash="book"
            className="rounded-full bg-[image:var(--gradient-cta)] px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
          >
            Book this service
          </Link>
          <WhatsAppButton text="Ask on WhatsApp" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Final price depends on room size and dirt level — confirmed on WhatsApp before we start.
        </p>
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
