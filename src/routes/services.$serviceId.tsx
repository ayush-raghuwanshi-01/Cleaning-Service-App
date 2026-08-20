import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, X, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StickyBar } from "@/components/layout/StickyBar";
import { Button, Card, CardContent, CardHeader, CardTitle, PageLoader } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";
import { serviceImage } from "@/lib/service-images";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const Route = createFileRoute("/services/$serviceId")({
  component: ServiceDetailPage,
});

const DEFAULT_EXCLUSIONS = [
  "Wall painting, plaster or civil repair work",
  "Moving heavy furniture or almirahs",
  "Exterior windows above ground floor",
];

function ServiceDetailPage() {
  const { serviceId } = Route.useParams();
  const { data: services = [], isLoading } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const service = services.find((s) => s.id === serviceId);

  if (isLoading) return <PageLoader />;

  if (!service) {
    return (
      <AppLayout>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Link to="/services" className="mt-4 inline-block text-sm font-bold text-primary">
            Browse all services
          </Link>
        </div>
      </AppLayout>
    );
  }

  const exclusions = service.excludes?.length ? service.excludes : DEFAULT_EXCLUSIONS;

  return (
    <AppLayout>
      <Link to="/services" className="text-xs font-semibold text-muted-foreground">
        ← All services
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <img src={serviceImage(service.id)} alt={service.name} className="h-64 w-full object-cover md:h-80" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">{service.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary">
              {service.price_max ? `${inr(service.base_price)}–${inr(service.price_max)}` : inr(service.base_price)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
              <Clock className="h-3.5 w-3.5" /> {durationLabel(service.duration_minutes)}
            </span>
          </div>
          {service.description && <p className="mt-4 text-sm text-muted-foreground">{service.description}</p>}

          {(service.addon_price_30min || service.addon_price_60min) && (
            <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-3 text-sm">
              <p className="font-bold">Add-ons</p>
              <p className="mt-1 text-muted-foreground">
                +30 min {service.addon_price_30min ? inr(service.addon_price_30min) : "—"}
                {" · "}+1 hr {service.addon_price_60min ? inr(service.addon_price_60min) : "—"}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/" search={{ service: service.id, book: undefined }} hash="book">
              <Button size="lg">Book this service</Button>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like to ask about ${service.name}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground"
            >
              <MessageCircle className="h-4 w-4 text-accent" /> Ask on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Final price depends on the actual work and is confirmed on a call before we start.
            Pay by UPI or cash after the service.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>What's included</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(service.includes ?? []).map((i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {i}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Not included</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exclusions.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {i}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <StickyBar />
    </AppLayout>
  );
}