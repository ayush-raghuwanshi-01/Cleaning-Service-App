import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchOrder } from "@/lib/orders-api";
import { ORDER_STATUS_LABEL } from "@/types";
import { formatDate } from "@/lib/format";
import { BRAND_CITY, BRAND_NAME, BUSINESS_EMAIL, SUPPORT_PHONE, formatPhone } from "@/lib/config";
import { ErrorState, PageLoader } from "@/components/ui";

export const Route = createFileRoute("/orders/$orderId/invoice")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  },
  head: () => ({ meta: [{ title: `Receipt — ${BRAND_NAME}` }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: Boolean(user),
    meta: { silent: true },
  });

  if (isLoading) return <PageLoader />;
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/60 p-6">
        <ErrorState
          title="Couldn't load this receipt"
          error={error}
          onRetry={() => refetch()}
          className="max-w-md bg-white"
        />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/60 p-6 text-center">
        <div>
          <p className="text-lg font-bold">Receipt unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This booking can't be found for your account.
          </p>
          <Link to="/orders" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Back to my bookings
          </Link>
        </div>
      </div>
    );
  }

  const addonsTotal = order.addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const paid = order.payments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = (order.amount ?? 0) + addonsTotal;

  return (
    <div className="min-h-screen bg-secondary/60 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="no-print mb-4 flex items-center justify-between">
          <Link to="/orders/$orderId" params={{ orderId }} className="text-xs font-semibold text-muted-foreground">
            ← Back to booking
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Printer className="h-4 w-4" /> Print / save PDF
          </button>
        </div>

        <article className="print-area rounded-2xl border border-border bg-card p-8 shadow-card">
          {/* Header */}
          <header className="flex items-start justify-between border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">{BRAND_NAME}</p>
                <p className="text-xs text-muted-foreground">{BRAND_CITY} · {formatPhone(SUPPORT_PHONE)}</p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="text-sm font-bold text-foreground">RECEIPT</p>
              <p>{order.order_code}</p>
              <p>Issued {formatDate(order.created_at.slice(0, 10))}</p>
            </div>
          </header>

          {/* Customer + service */}
          <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Billed to</p>
              <p className="mt-1 text-sm font-semibold">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.street}, {order.area}, {order.city} {order.pincode}
              </p>
              <p className="text-sm text-muted-foreground">+{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Service</p>
              <p className="mt-1 text-sm font-semibold">{order.service_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.scheduled_date)} · {order.scheduled_slot}
              </p>
              <p className="text-sm text-muted-foreground">Status: {ORDER_STATUS_LABEL[order.status]}</p>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full py-4 text-sm">
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-3">{order.service_name}</td>
                <td className="py-3 text-right font-semibold">
                  {order.amount != null ? `₹${order.amount}` : "To be confirmed"}
                </td>
              </tr>
              {order.addons.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="py-3">
                    Add-on: {a.addon_type === "30min" ? "30 minutes" : "60 minutes"} × {a.quantity}
                  </td>
                  <td className="py-3 text-right font-semibold">₹{a.price * a.quantity}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-bold">Total</td>
                <td className="py-3 text-right font-display text-lg font-extrabold">₹{grandTotal}</td>
              </tr>
              <tr className="border-t border-border/60">
                <td className="py-2 text-muted-foreground">Paid ({order.payment_summary})</td>
                <td className="py-2 text-right font-semibold text-accent">₹{paid}</td>
              </tr>
              {grandTotal - paid > 0 && (
                <tr>
                  <td className="py-2 text-muted-foreground">Balance due after service</td>
                  <td className="py-2 text-right font-semibold">₹{grandTotal - paid}</td>
                </tr>
              )}
            </tbody>
          </table>

          <footer className="mt-8 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              Thank you for choosing {BRAND_NAME}! This receipt was generated
              automatically. For queries: {formatPhone(SUPPORT_PHONE)} · {BUSINESS_EMAIL}
            </p>
            <p className="mt-1">Services rendered in {BRAND_CITY}. Prices include all applicable charges.</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
