import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/lib/admin-api";
import { Badge, ErrorState, OrderRowSkeleton, StatusBadge } from "@/components/ui";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
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
  const navigate = useNavigate();
  const { status: searchStatus } = Route.useSearch();
  const [status, setStatus] = useState<OrderStatus | "">(
    (searchStatus as OrderStatus) ?? "",
  );
  const [page, setPage] = useState(1);

  // Keep the URL in sync so filtered views are shareable/bookmarkable and the
  // browser back button behaves as expected.
  function selectStatus(next: OrderStatus | "") {
    setStatus(next);
    setPage(1);
    navigate({
      to: "/admin/orders",
      search: next ? { status: next } : { status: undefined },
      replace: true,
    });
  }

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () => fetchAdminOrders(status ? { status } : {}, page, PAGE_SIZE),
    placeholderData: (prev) => prev,
    meta: { silent: true },
  });

  const orders = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? orders.length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        {!isLoading && !error && (
          <p className="text-xs font-semibold text-muted-foreground">
            {total} order{total === 1 ? "" : "s"}
            {status ? ` · ${ORDER_STATUS_LABEL[status as OrderStatus] ?? status}` : ""}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => selectStatus(f)}
            aria-pressed={status === f}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              status === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-border/60 hover:text-foreground"
            }`}
          >
            {f === "" ? "All" : ORDER_STATUS_LABEL[f as OrderStatus]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && orders.length === 0 ? (
          <>
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </>
        ) : error ? (
          <ErrorState
            title="Couldn't load orders"
            error={error}
            onRetry={() => refetch()}
          />
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm font-bold">
              {status ? `No ${ORDER_STATUS_LABEL[status as OrderStatus]?.toLowerCase()} orders` : "No orders yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {status
                ? "Orders appear here the moment customers book or you log them."
                : "Bookings from the website, phone and WhatsApp all land here."}
            </p>
          </div>
        ) : (
          <>
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/admin/orders/$orderId"
                params={{ orderId: o.id }}
                search={{ status: undefined }}
              >
                <div
                  className={`flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-card ${
                    isFetching ? "opacity-70" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{o.service_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.customer_name} · +{o.customer_phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.order_code} · {formatDate(o.scheduled_date)} · {o.scheduled_slot} ·
                      placed {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={o.status} />
                    <Badge className="bg-secondary capitalize text-muted-foreground">{o.source}</Badge>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary/80 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary/80 disabled:opacity-50"
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
