import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/lib/admin-api";
import { Badge, Card } from "@/components/ui";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const FILTERS: (OrderStatus | "")[] = ["", "requested", "contacted", "confirmed", "in_progress", "completed", "cancelled"];

function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | "">("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => fetchAdminOrders(status ? { status } : {}),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              status === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f === "" ? "All" : ORDER_STATUS_LABEL[f as OrderStatus]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders match.</p>
        ) : (
          orders.map((o) => (
            <Link key={o.id} to="/admin/orders/$orderId" params={{ orderId: o.id }}>
              <Card className="flex items-center justify-between gap-4 p-4 transition hover:border-primary/60">
                <div>
                  <p className="text-sm font-bold">{o.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customer_name} · {o.customer_phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.scheduled_date} · {o.scheduled_slot} · {formatDateTime(o.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-primary/10 text-primary">{ORDER_STATUS_LABEL[o.status]}</Badge>
                  <span className="text-xs text-muted-foreground">from {o.source}</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
