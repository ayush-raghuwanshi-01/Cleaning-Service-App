import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { TrustStrip } from "@/components/site/TrustStrip";
import { BookingWidget } from "@/components/site/BookingWidget";
import { Areas } from "@/components/site/Areas";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Reviews } from "@/components/site/Reviews";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search['service'] === "string" ? (search['service'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "2-Hour Home Cleaning at ₹399 in Bhopal | SparkleHome" },
      {
        name: "description",
        content:
          "Book verified home cleaners in Bhopal for ₹399. 2-hour housekeeping, car wash and deep cleaning with UPI payment and live order tracking.",
      },
      { property: "og:title", content: "2-Hour Home Cleaning at ₹399 in Bhopal | SparkleHome" },
      {
        property: "og:description",
        content:
          "Verified & trained staff, transparent pricing, UPI payment and live tracking across MP Nagar, Arera Colony, Kolar and Indrapuri.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { service } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <BookingWidget preselectServiceId={service} />
        <Areas />
        <BeforeAfter />
        <Reviews />
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
