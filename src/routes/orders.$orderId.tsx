import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Phone, Printer, ShieldQuestion, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cancelOrder, fetchOrder } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageLoader } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const Route = createFileRoute("/orders/$orderId")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: Boolean(user),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Booking cancelled", "No charges apply. Re-book anytime.");
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err) =>
      toast.error(
        "Could not cancel",
        err instanceof ApiError ? err.message : "Please call us and we'll help.",
      ),
  });

  if (isLoading) return <PageLoader />;
  if (!order) {
    return (
      <AppLayout>
        <p className="py-16 text-center text-muted-foreground">Order not found.</p>
      </AppLayout>
    );
  }

  const currentIndex = Math.max(0, ORDER_STATUS_FLOW.indexOf(order.status));
  const cancellable = ["requested", "contacted", "confirmed"].includes(order.status);

  return (
    <AppLayout>
      <Link to="/orders" className="text-xs font-semibold text-muted-foreground">
        ← My bookings
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{ORDER_STATUS_LABEL[order.status]}</h1>
        <Badge className="bg-primary/10 text-primary">{order.order_code}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.service_name} · {formatDate(order.scheduled_date)} · {order.scheduled_slot}
      </p>

      {/* Horizontal status stepper */}
      <ol className="mt-8 flex items-center gap-1" aria-label="Booking progress">
        {ORDER_STATUS_FLOW.map((stage, i) => {
          const done = i < currentIndex;
          const activeNow = i === currentIndex;
          return (
            <li key={stage} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <div className="flex w-full items-center">
                <span
                  className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : done || activeNow ? "bg-accent" : "bg-border"}`}
                />
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                    done
                      ? "border-accent bg-accent"
                      : activeNow
                        ? "border-primary bg-primary"
                        : "border-border bg-background"
                  }`}
                />
                <span
                  className={`h-0.5 flex-1 ${i === ORDER_STATUS_FLOW.length - 1 ? "bg-transparent" : done ? "bg-accent" : "bg-border"}`}
                />
              </div>
              <span className={`text-[10px] font-semibold sm:text-xs ${done || activeNow ? "text-foreground" : "text-muted-foreground"}`}>
                {ORDER_STATUS_LABEL[stage]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Service address</CardTitle></CardHeader>
          <CardContent>
            <p className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {order.street}, {order.area}, {order.city} {order.pincode}
                {order.floor ? ` (${order.floor})` : ""}
              </span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" /> +{order.customer_phone}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.payment_summary}</p>
            {order.amount && (
              <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                ₹{order.amount}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Pay after the job by UPI or cash.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/orders/$orderId/invoice" params={{ orderId: order.id }}>
          <Button variant="outline">
            <Printer className="h-4 w-4" /> View receipt
          </Button>
        </Link>
        {cancellable && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Cancel this booking? No charges apply.")) {
                cancelMutation.mutate();
              }
            }}
            disabled={cancelMutation.isPending}
          >
            <XCircle className="h-4 w-4" /> Cancel booking
          </Button>
        )}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Hi! I need help with my booking ${order.order_code} (${order.service_name}).`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary"
        >
          <ShieldQuestion className="h-4 w-4" /> Need to reschedule?
        </a>
      </div>

      {/* Activity timeline */}
      {order.events.length > 0 && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Order activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(e.created_at)}
                  </span>
                  <span className="text-foreground/85">{e.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
