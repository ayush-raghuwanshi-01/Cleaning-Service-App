import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchServiceAreas } from "@/lib/services-api";
import { BRAND_CITY, FALLBACK_SERVICE_AREAS } from "@/lib/config";

export function Areas() {
  const { data: areas = [] } = useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });
  const liveAreas = areas.filter((a) => a.is_active);
  const shown = liveAreas.length > 0 ? liveAreas : FALLBACK_SERVICE_AREAS.map((name) => ({ id: name, name, pincode: "" }));

  return (
    <section className="border-t border-border bg-secondary/50 py-14" id="areas">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Service area
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              We serve all of {BRAND_CITY}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Homes, societies, shops, offices, hospitals and hotels — if it's
              in {BRAND_CITY}, we'll clean it. Not sure about your area? Call us.
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/home+cleaning+services+${encodeURIComponent(BRAND_CITY)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <MapPin className="h-4 w-4 text-accent" /> View on map
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {shown.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
            >
              <MapPin className="h-3.5 w-3.5 text-accent" /> {a.name}
              {"pincode" in a && a.pincode ? ` · ${a.pincode}` : ""}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-primary">
            + surrounding {BRAND_CITY} localities
          </span>
        </div>

        <Link
          to="/"
          search={{ service: undefined, book: true }}
          hash="book"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          Book in your area <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
