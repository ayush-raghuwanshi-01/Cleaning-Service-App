import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  BRAND_CITY,
  BRAND_NAME,
  BUSINESS_EMAIL,
  FALLBACK_SERVICE_AREAS,
  SUPPORT_PHONE,
  WHATSAPP_NUMBER,
  formatPhone,
} from "@/lib/config";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: `Help & FAQs — ${BRAND_NAME} ${BRAND_CITY}` },
      {
        name: "description",
        content: `How booking, pricing, payments and service areas work for ${BRAND_NAME} cleaning services in ${BRAND_CITY}.`,
      },
    ],
  }),
  component: HelpPage,
});

function faqs(areasText: string) {
  return [
    {
      q: "How do I book?",
      a: "Log in, choose a service, pick a slot and enter your address. Our team contacts you to confirm details and the final price.",
    },
    {
      q: "How is the price decided?",
      a: "The price depends on the actual work. We estimate the hours and confirm the amount with you before starting.",
    },
    {
      q: "How do I pay?",
      a: "You can pay by UPI or cash. Payment is recorded against your order after collection.",
    },
    {
      q: "Which areas do you serve?",
      a: `We currently handle selected ${BRAND_CITY} locations including ${areasText}. Not sure about yours? Call us — if it's nearby, we'll usually make it work.`,
    },
    {
      q: "Is your staff verified?",
      a: "Yes. Home Shine works with verified, background-checked and experienced housekeeping staff for the specific service locations we handle.",
    },
    {
      q: "Can I cancel or reschedule?",
      a: "Yes — cancel free of charge from your bookings page any time before the team starts. To reschedule, message us on WhatsApp with your booking code and we'll move it for you.",
    },
  ];
}

function HelpPage() {
  const phoneLabel = formatPhone(SUPPORT_PHONE);
  const whatsappNumber = WHATSAPP_NUMBER || SUPPORT_PHONE;
  const areasList = FALLBACK_SERVICE_AREAS;
  const areasText = areasList.length
    ? `${areasList.slice(0, -1).join(", ")} and ${areasList[areasList.length - 1]}`
    : `selected localities across ${BRAND_CITY}`;
  const FAQS = faqs(areasText);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Help & FAQs</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Call</CardTitle></CardHeader>
          <CardContent>
            {SUPPORT_PHONE ? (
              <a className="text-sm text-muted-foreground hover:text-foreground" href={`tel:+${SUPPORT_PHONE}`}>
                {phoneLabel}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Our phone line is being set up — please use WhatsApp or email for now.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-accent" /> WhatsApp</CardTitle></CardHeader>
          <CardContent>
            {whatsappNumber ? (
              <a
                className="text-sm text-muted-foreground hover:text-foreground"
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">WhatsApp support is coming soon — please call or email us.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email</CardTitle></CardHeader>
          <CardContent>
            {BUSINESS_EMAIL ? (
              <a className="text-sm text-muted-foreground hover:text-foreground" href={`mailto:${BUSINESS_EMAIL}`}>
                {BUSINESS_EMAIL}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Email support is coming soon — please call or message us.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
        {FAQS.map((f) => (
          <Card key={f.q} className="p-5">
            <h3 className="font-bold">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
