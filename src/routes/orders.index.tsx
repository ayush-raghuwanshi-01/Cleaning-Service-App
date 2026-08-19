import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchMyOrders } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Card, PageLoader } from "@/components/ui";
import { ORDER_STATUS_LABEL } from "@/types";

export const Route = createFileRoute("/orders/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: Boolean(user),
  });

  if (isLoading) return <PageLoader />;

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-extrabold">My orders</h1>
      {orders.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Link to="/" search={{ service: undefined, book: undefined }} className="mt-4 inline-block text-sm font-bold text-primary">
            Book your first clean
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to="/orders/$orderId" params={{ orderId: o.id }}>
              <Card className="flex items-center justify-between gap-4 p-5 transition hover:border-primary/60">
                <div>
                  <p className="text-sm font-bold">{o.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.order_code} · {o.scheduled_date} · {o.scheduled_slot}
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
