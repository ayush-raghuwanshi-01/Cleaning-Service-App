import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

const FAQS = [
  {
    q: "How do I book?",
    a: "Log in, choose a service, pick a slot and enter your address. Our team calls you to confirm details and the final price.",
  },
  {
    q: "How is the price decided?",
    a: "The price depends on the actual work. We estimate the hours on a call and confirm the amount with you before starting.",
  },
  {
    q: "How do I pay?",
    a: "You can pay by UPI or cash. Payment is collected after the work is completed.",
  },
  {
    q: "Which areas do you serve?",
    a: "MP Nagar, Arera Colony, Gulmohar, Kolar Road, Indrapuri, Shahpura, Ayodhya Bypass, Hoshangabad Road, Bairagarh and more in Bhopal.",
  },
  {
    q: "Is your staff verified?",
    a: "Yes. Every cleaner is verified, background-checked and trained on cleaning and safety.",
  },
];

function HelpPage() {
  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Help & FAQs</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Call</CardTitle></CardHeader>
          <CardContent>
            <a className="text-sm text-muted-foreground hover:text-foreground" href={`tel:+${WHATSAPP_NUMBER}`}>
              +91 {WHATSAPP_NUMBER}
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-accent" /> WhatsApp</CardTitle></CardHeader>
          <CardContent>
            <a
              className="text-sm text-muted-foreground hover:text-foreground"
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message us on WhatsApp
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email</CardTitle></CardHeader>
          <CardContent>
            <a className="text-sm text-muted-foreground hover:text-foreground" href="mailto:support@sparklehome.in">
              support@sparklehome.in
            </a>
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
