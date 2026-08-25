import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { trackOrder } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Input, Label, StatusBadge } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";

const CODE_PATTERN = /^SH-[A-Z0-9]{4,10}$/;

export function TrackPage({ initialCode = "" }: { initialCode?: string }) {
  const toast = useToast();
  const [query, setQuery] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["track", submitted],
    queryFn: () => trackOrder(submitted),
    enabled: Boolean(submitted),
    retry: false,
    meta: { silent: true },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = query.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      toast.warning("Check the code", "Booking codes look like SH-ABC123 — check your confirmation message.");
      return;
    }
    setSubmitted(code);
  }

  const notFound =
    error instanceof ApiError && (error.status === 404 || error.code === "not_found");

  return (
    <AppLayout>
      <h1 className="font-display text-2xl font-bold">Track your booking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your booking code (e.g. SH-ABC123) — it's in your booking confirmation.
      </p>

      <form className="mt-5 flex max-w-md items-end gap-2" onSubmit={submit}>
        <div className="flex-1">
          <Label htmlFor="code">Booking code</Label>
          <Input
            id="code"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="SH-ABC123"
            className="uppercase"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="code-hint"
          />
          <p id="code-hint" className="mt-1 text-xs text-muted-foreground">
            Found in your confirmation toast and receipt.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4" /> {isLoading ? "Checking…" : "Track"}
        </Button>
      </form>

      <div className="mt-8 max-w-lg">
        {isLoading && (
          <Card className="animate-pulse p-6">
            <div className="h-5 w-2/3 rounded bg-secondary" />
            <div className="mt-3 h-3 w-1/2 rounded bg-secondary" />
            <div className="mt-6 space-y-3">
              <div className="h-3 w-full rounded bg-secondary" />
              <div className="h-3 w-5/6 rounded bg-secondary" />
            </div>
          </Card>
        )}

        {!isLoading && error && (
          notFound ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm font-bold">No booking found with that code</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Double-check the code, or log in to see all your bookings.
              </p>
            </div>
          ) : (
            <ErrorState
              title="Couldn't check your booking"
              error={error}
              onRetry={() => refetch()}
            />
          )
        )}

        {!isLoading && data && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{data.service_name}</CardTitle>
                <StatusBadge status={data.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {data.order_code} · {formatDate(data.scheduled_date)} · {data.scheduled_slot}
              </p>
            </CardHeader>
            <CardContent>
              {data.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your booking is registered — updates will appear here as our team progresses.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.events.map((e, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                      <div>
                        <p>{e.message}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
