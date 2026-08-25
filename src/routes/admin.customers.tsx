import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Phone, RotateCcw, Search, UserRound } from "lucide-react";
import { fetchAdminCustomers, setCustomerActive, type AdminCustomer } from "@/lib/admin-api";
import { Badge, Card, ErrorState, Input } from "@/components/ui";
import { OrderRowSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/format";
import { inr } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { telHref, waHref } from "@/lib/contact";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-customers", submitted],
    queryFn: () => fetchAdminCustomers(submitted),
    meta: { silent: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone who has registered or booked. Blocked customers can't log in or place bookings.
      </p>

      <form
        className="mt-5 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(search.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or email…"
            className="pl-9"
            aria-label="Search customers"
          />
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <>
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </>
        ) : error ? (
          <ErrorState
            title="Couldn't load customers"
            error={error}
            onRetry={() => refetch()}
          />
        ) : (customers ?? []).length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            {submitted
              ? `No customers match "${submitted}".`
              : "No customers yet — they'll appear here after registering."}
          </Card>
        ) : (
          (customers ?? []).map((c) => <CustomerRow key={c.id} customer={c} />)
        )}
      </div>
    </div>
  );
}

function CustomerRow({ customer }: { customer: AdminCustomer }) {
  const qc = useQueryClient();
  const toast = useToast();

  const blockMutation = useMutation({
    mutationFn: () => setCustomerActive(customer.id, !customer.is_active),
    onSuccess: () => {
      toast.success(
        customer.is_active ? "Customer blocked" : "Customer unblocked",
        customer.is_active
          ? `${customer.full_name} can no longer log in.`
          : `${customer.full_name} can log in again.`,
      );
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: (err) =>
      toast.error("Action failed", err instanceof ApiError ? err.message : undefined),
    meta: { silent: true },
  });

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-primary">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold">
            {customer.full_name}
            {!customer.is_active && (
              <Badge className="bg-red-100 text-red-800">Blocked</Badge>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            +{customer.phone}
            {customer.email ? ` · ${customer.email}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {customer.total_orders} bookings · {customer.completed_orders} completed ·{" "}
            {customer.last_order_at
              ? `last ${formatDate(customer.last_order_at.slice(0, 10))}`
              : "no bookings yet"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold text-primary">
          {inr(customer.total_spend)}
        </span>
        <a
          href={telHref(customer.phone)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
          aria-label={`Call ${customer.full_name}`}
        >
          <Phone className="h-4 w-4" />
        </a>
        <a
          href={waHref(customer.phone, `Hi ${customer.full_name}, `)}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-whatsapp hover:text-whatsapp"
          aria-label={`WhatsApp ${customer.full_name}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.3.5-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.5.3.1.2.1.7-.1 1.3Z" />
          </svg>
        </a>
        <button
          onClick={() => blockMutation.mutate()}
          disabled={blockMutation.isPending}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            customer.is_active
              ? "bg-red-50 text-red-700 hover:bg-red-100"
              : "bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          {customer.is_active ? (
            <>
              <Ban className="h-3.5 w-3.5" /> Block
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" /> Unblock
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
