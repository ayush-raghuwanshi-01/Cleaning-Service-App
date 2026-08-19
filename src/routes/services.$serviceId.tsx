import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PageLoader } from "@/components/ui";
import { fetchServices } from "@/lib/services-api";
import { inr, durationLabel } from "@/lib/format";

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
      <h1 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">{service.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">
          {service.price_max ? `${inr(service.base_price)}–${inr(service.price_max)}` : inr(service.base_price)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
          <Clock className="h-3.5 w-3.5" /> {durationLabel(service.duration_minutes)}
        </span>
      </div>
      {service.description && <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{service.description}</p>}

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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/" search={{ service: service.id, book: undefined }} hash="book">
          <Button size="lg">Book this service</Button>
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Final price depends on the actual work and is confirmed on a call before we start.
      </p>
    </AppLayout>
  );
}
