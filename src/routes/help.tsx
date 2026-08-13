import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBar } from "@/components/site/StickyBar";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { WHATSAPP_NUMBER } from "@/lib/booking";

const FAQS = [
  {
    q: "Payment kaise hota hai?",
    a: "You can pay upfront by UPI (PhonePe, Google Pay, Paytm or any UPI app) while booking. Cash on completion is also accepted for maintenance visits.",
  },
  {
    q: "Kya-kya included hai?",
    a: "Every service page lists exact inclusions and exclusions. Our crew brings their own cleaning kit, machines and safety gear.",
  },
  {
    q: "How long does a job take?",
    a: "Express housekeeping takes 2 hours. Bathroom cleaning 1-1.5 hours, kitchen 2 hours, and deep home cleaning 4-6 hours depending on home size.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Free cancellation up to 2 hours before the slot — full UPI refund within 3-5 working days. Cancellations after the crew reaches your address carry a ₹99 visit charge.",
  },
  {
    q: "Which Bhopal areas do you serve?",
    a: "MP Nagar, Arera Colony, Gulmohar, Kolar Road, Indrapuri, Shahpura, Ayodhya Bypass, Hoshangabad Road, Bairagarh and Old City.",
  },
  {
    q: "Is your staff verified?",
    a: "Yes. Every cleaner is police verified, background checked, uniformed and trained on chemical safety.",
  },
];

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help, Contact & FAQs | SparkleHome Bhopal" },
      {
        name: "description",
        content:
          "Contact SparkleHome Bhopal on WhatsApp or phone, and read FAQs on payment, inclusions, timings and cancellation policy.",
      },
      { property: "og:title", content: "Help, Contact & FAQs | SparkleHome Bhopal" },
      {
        property: "og:description",
        content: "WhatsApp support, phone, email and answers to common cleaning service questions in Bhopal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Help & contact</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mon-Sun, 7 AM - 9 PM. Fastest replies on WhatsApp.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60"
          >
            <Phone className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-bold">Call us</p>
            <p className="text-xs text-muted-foreground">+91 98765 43210</p>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent/60"
          >
            <MessageCircle className="h-5 w-5 text-accent" />
            <p className="mt-2 text-sm font-bold">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Book or ask anything</p>
          </a>
          <a
            href="mailto:hello@sparklehome.in"
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60"
          >
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-bold">Email</p>
            <p className="text-xs text-muted-foreground">hello@sparklehome.in</p>
          </a>
        </div>

        <h2 className="mt-10 font-display text-xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-bold marker:hidden">
                {f.q}
                <span className="float-right text-muted-foreground transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8">
          <WhatsAppButton text="Still need help? WhatsApp us" />
        </div>
      </main>
      <Footer />
      <StickyBar />
    </div>
  );
}
