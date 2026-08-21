import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ChevronRight, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchMyOrders } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Button, Card } from "@/components/ui";
import { OrderRowSkeleton } from "@/components/ui/Skeleton";
import { ORDER_STATUS_LABEL, type OrderSummary } from "@/types";
import { formatDate, todayISO } from "@/lib/format";

export const Route = createFileRoute("/orders/")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: MyOrdersPage,
});

const STATUS_BADGE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link to="/orders/$orderId" params={{ orderId: order.id }}>
      <Card className="flex items-center justify-between gap-4 p-5 transition hover:border-primary/60 hover:shadow-card">
        <div className="min-w-0">
          <p className="text-sm font-bold">{order.service_name}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {order.order_code} · {formatDate(order.scheduled_date)} · {order.scheduled_slot}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge className={STATUS_BADGE[order.status] ?? "bg-secondary text-foreground"}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  );
}

function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: Boolean(user),
  });

  const today = todayISO();
  const active = (orders ?? []).filter(
    (o) => o.scheduled_date >= today && o.status !== "cancelled" && o.status !== "completed",
  );
  const past = (orders ?? [])
    .filter((o) => !active.includes(o))
    .sort((a, b) => (a.scheduled_date < b.scheduled_date ? 1 : -1));

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hi {user?.full_name?.split(" ")[0]} — here's everything you've booked.
          </p>
        </div>
        <Link to="/" search={{ service: undefined, book: true }} hash="book">
          <Button>New booking</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          <OrderRowSkeleton />
          <OrderRowSkeleton />
          <OrderRowSkeleton />
        </div>
      ) : !isAuthenticated ? null : (orders ?? []).length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-primary">
            <CalendarClock className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-bold">No bookings yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Book a home cleaning in under 2 minutes. Pay only after the work is done.
          </p>
          <Link to="/" search={{ service: undefined, book: true }} hash="book" className="mt-5 inline-block">
            <Button size="lg">Book your first clean</Button>
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-8" aria-label="Upcoming bookings">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <CalendarClock className="h-5 w-5 text-primary" /> Upcoming
            </h2>
            <div className="mt-3 space-y-3">
              {active.length === 0 ? (
                <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                  No upcoming bookings. Ready for another clean?{" "}
                  <Link
                    to="/"
                    search={{ service: undefined, book: true }}
                    hash="book"
                    className="font-semibold text-primary hover:underline"
                  >
                    Book one now
                  </Link>
                </p>
              ) : (
                active.map((o) => <OrderCard key={o.id} order={o} />)
              )}
            </div>
          </section>

          {past.length > 0 && (
            <section className="mt-10" aria-label="Past bookings">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <History className="h-5 w-5 text-muted-foreground" /> Past
              </h2>
              <div className="mt-3 space-y-3">
                {past.map((o) => (
                  <div key={o.id} className="opacity-80 transition hover:opacity-100">
                    <OrderCard order={o} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </AppLayout>
  );
}
