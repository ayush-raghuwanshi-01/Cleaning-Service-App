import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { trackOrder } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import { ORDER_STATUS_LABEL } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

const STATUS_BADGE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function TrackPage({ initialCode = "" }: { initialCode?: string }) {
  const toast = useToast();
  const [query, setQuery] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);

  const { data, isLoading, error } = useQuery({
    queryKey: ["track", submitted],
    queryFn: () => trackOrder(submitted),
    enabled: Boolean(submitted),
    retry: false,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = query.trim().toUpperCase();
    if (!/^SH-[A-Z0-9]{4,10}$/i.test(code)) {
      toast.warning("Check the code", "Booking codes look like SH-ABC123.");
      return;
    }
    setSubmitted(code);
  }

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
          />
        </div>
        <Button type="submit">
          <Search className="h-4 w-4" /> Track
        </Button>
      </form>

      <div className="mt-8 max-w-lg">
        {isLoading && <Spinner />}
        {error && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-bold">No booking found with that code</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Double-check the code, or log in to see all your bookings.
            </p>
          </div>
        )}
        {data && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{data.service_name}</CardTitle>
                <Badge className={STATUS_BADGE[data.status] ?? "bg-secondary"}>
                  {ORDER_STATUS_LABEL[data.status as keyof typeof ORDER_STATUS_LABEL] ?? data.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.order_code} · {formatDate(data.scheduled_date)} · {data.scheduled_slot}
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
