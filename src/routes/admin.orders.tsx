import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/lib/admin-api";
import { Badge, Card } from "@/components/ui";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types";
import { formatDateTime } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search.status === "string" ? search.status : undefined,
  }),
  component: AdminOrders,
});

const FILTERS: (OrderStatus | "")[] = [
  "",
  "requested",
  "contacted",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

const PAGE_SIZE = 50;

function AdminOrders() {
  const { status: searchStatus } = Route.useSearch();
  const [status, setStatus] = useState<OrderStatus | "">(
    (searchStatus as OrderStatus) ?? "",
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () =>
      fetchAdminOrders(status ? { status } : {}, page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const orders = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              status === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f === "" ? "All" : ORDER_STATUS_LABEL[f as OrderStatus]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders match.</p>
        ) : (
          <>
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/admin/orders/$orderId"
                params={{ orderId: o.id }}
              >
                <Card className="flex items-center justify-between gap-4 p-4 transition hover:border-primary/60">
                  <div>
                    <p className="text-sm font-bold">{o.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.customer_name} · {o.customer_phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.scheduled_date} · {o.scheduled_slot} ·{" "}
                      {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-primary/10 text-primary">
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      from {o.source}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/80 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/80 disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}