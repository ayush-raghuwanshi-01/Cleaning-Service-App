import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/site/Header";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useOps } from "@/lib/ops-store";
import { STATUS_FLOW, STATUS_LABEL, bookingWhatsAppMessage, buildWhatsAppLink, inr } from "@/lib/booking";

export const Route = createFileRoute("/track/$orderId")({
  head: () => ({
    meta: [
      { title: "Track your cleaning order | SparkleHome Bhopal" },
      {
        name: "description",
        content:
          "Live status of your SparkleHome booking in Bhopal: payment confirmed, cleaner assigned, on the way, work in progress and completed.",
      },
      { property: "og:title", content: "Track your cleaning order | SparkleHome Bhopal" },
      {
        property: "og:description",
        content: "Follow your cleaner from assignment to the final sparkle, with a live timer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function TrackPage() {
  const { orderId } = Route.useParams();
  const { orders, employees } = useOps();
  const [now, setNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const order = orders[orderId];

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't find booking {orderId} on this device.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-[image:var(--gradient-cta)] px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Book a cleaning
          </Link>
        </div>
      </div>
    );
  }

  const cleaner = employees.find((e) => e.id === order.employeeId);
  const currentIndex = Math.max(0, STATUS_FLOW.indexOf(order.status));
  const remaining = order.startedAt
    ? order.startedAt + order.durationMins * 60_000 - now
    : order.durationMins * 60_000;

  const notes: Record<string, string> = {
    paid: `UPI ref ${order.upiRef}`,
    assigned: cleaner ? `${cleaner.name} · ${cleaner.area}` : "Dispatch in progress",
    on_the_way: cleaner ? `${cleaner.name} is heading to you` : "Cleaner en route",
    in_progress: `${Math.round(order.durationMins / 60)}-hour service running`,
    completed: "Rate your cleaner",
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          Booking {order.id}
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">
          {STATUS_LABEL[order.status]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.serviceName} · {order.date} · {order.slot}
        </p>
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft/60 p-4">
          <p className="text-sm font-bold text-accent">Booking confirmed — send it on WhatsApp</p>
          <p className="mt-1 text-xs text-muted-foreground">
            One tap sends your booking details to our Bhopal support team for confirmation.
          </p>
          <a
            href={buildWhatsAppLink(bookingWhatsAppMessage(order))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
          >
            WhatsApp पर भेजें
          </a>
        </div>

        {order.status === "in_progress" && (
          <div className="mt-6 rounded-2xl bg-[image:var(--gradient-cta)] p-5 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Live service timer
            </p>
            <p className="font-display text-4xl font-extrabold tabular-nums">{fmt(remaining)}</p>
          </div>
        )}

        {order.proofPhoto && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-bold">Completion photo</p>
            <img
              src={order.proofPhoto}
              alt="Photo of the completed cleaning job"
              className="mt-3 max-h-72 w-full rounded-xl object-cover"
            />
          </div>
        )}

        <ol className="mt-8 space-y-1">
          {STATUS_FLOW.map((stage, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={stage} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
                  ) : active ? (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </span>
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 text-muted-foreground/40" />
                  )}
                  {i < STATUS_FLOW.length - 1 && (
                    <span
                      className={`my-1 w-0.5 flex-1 rounded ${done ? "bg-accent" : "bg-border"}`}
                    />
                  )}
                </div>
                <div className={`pb-6 ${active || done ? "" : "opacity-50"}`}>
                  <p className="text-sm font-bold">{STATUS_LABEL[stage]}</p>
                  <p className="text-xs text-muted-foreground">{notes[stage]}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">Service address</h2>
            <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {order.street}, {order.area}, Bhopal {order.pincode}
              </span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" /> +91 {order.mobile}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">Payment</h2>
            <p className="mt-2 text-sm text-muted-foreground">UPI ref {order.upiRef}</p>
            <p className="font-display text-2xl font-extrabold text-primary">
              {inr(order.amount)} paid
            </p>
            <div className="mt-4">
              <WhatsAppButton text="Need help?" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
