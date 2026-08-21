import { createFileRoute } from "@tanstack/react-router";
import { FullBleedLayout } from "@/components/layout/AppLayout";
import { Hero } from "@/components/marketing/Hero";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ServiceStrip } from "@/components/marketing/ServiceStrip";
import { WhyUs } from "@/components/marketing/WhyUs";
import { BeforeAfter } from "@/components/marketing/BeforeAfter";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Areas } from "@/components/marketing/Areas";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === "string" ? search.service : undefined,
    book: search.book === true || search.book === "1" ? true : undefined,
  }),
  component: HomePage,
});

function HomePage() {
  // Optional query params: ?service=<id>&book=1 (e.g. from a service page's
  // "Book this service" link).
  const { service } = Route.useSearch();

  return (
    <FullBleedLayout>
      <Hero />
      <TrustStrip />
      <BookingWidget preselectServiceId={service} />
      <ServiceStrip />
      <WhyUs />
      <BeforeAfter />
      <Testimonials />
      <Areas />
    </FullBleedLayout>
  );
}
