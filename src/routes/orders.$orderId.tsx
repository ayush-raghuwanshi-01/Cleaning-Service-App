import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchOrder } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageLoader } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "@/types";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/orders/$orderId")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: Boolean(user),
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

  return (
    <AppLayout>
      <Link to="/orders" className="text-xs font-semibold text-muted-foreground">← My orders</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{ORDER_STATUS_LABEL[order.status]}</h1>
        <Badge className="bg-primary/10 text-primary">{order.order_code}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.service_name} · {order.scheduled_date} · {order.scheduled_slot}
      </p>

      {/* Timeline */}
      <ol className="mt-8 space-y-1">
        {ORDER_STATUS_FLOW.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={stage} className="flex items-start gap-4">
              <span
                className={`mt-1 h-3 w-3 rounded-full ${done ? "bg-accent" : active ? "bg-primary" : "bg-border"}`}
              />
              <span className={`text-sm ${done || active ? "font-semibold" : "text-muted-foreground"}`}>
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
              <span>{order.street}, {order.area}, {order.city} {order.pincode}</span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" /> +91 {order.customer_phone}
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
          </CardContent>
        </Card>
      </div>

      {/* Activity timeline */}
      {order.events.length > 0 && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Order activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
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
