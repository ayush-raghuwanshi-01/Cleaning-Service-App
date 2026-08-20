import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BUSINESS_EMAIL, SUPPORT_PHONE, WHATSAPP_NUMBER, formatPhone } from "@/lib/config";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

const FAQS = [
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
    a: "We currently handle selected Bhopal locations including MP Nagar, Minal, JK Road, Avadhpuri, Indrapuri, Patel Nagar, Ayodhya By Pass, Ayodhya Nagar and Ashoka Garden.",
  },
  {
    q: "Is your staff verified?",
    a: "Yes. Home Shine works with verified, background-checked and experienced housekeeping staff for the specific service locations we handle.",
  },
];

function HelpPage() {
  const phoneLabel = formatPhone(SUPPORT_PHONE);
  const whatsappNumber = WHATSAPP_NUMBER || SUPPORT_PHONE;

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
              <p className="text-sm text-muted-foreground">Add support phone in environment settings.</p>
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
              <p className="text-sm text-muted-foreground">Add WhatsApp number in environment settings.</p>
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
              <p className="text-sm text-muted-foreground">Add support email in environment settings.</p>
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
