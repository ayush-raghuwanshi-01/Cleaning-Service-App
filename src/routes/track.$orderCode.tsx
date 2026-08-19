import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackOrder } from "@/lib/orders-api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import { ORDER_STATUS_LABEL } from "@/types";

export const Route = createFileRoute("/track/$orderCode")({
  component: TrackPage,
});

function TrackPage() {
  const { orderCode } = Route.useParams();
  const [query, setQuery] = useState(orderCode ?? "");
  const [submitted, setSubmitted] = useState(orderCode ?? "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["track", submitted],
    queryFn: () => trackOrder(submitted),
    enabled: Boolean(submitted),
  });

  return (
    <AppLayout>
      <h1 className="font-display text-2xl font-bold">Track your order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your booking code (e.g. SH-ABC123) to see the latest status.
      </p>

      <form
        className="mt-5 flex max-w-md items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <div className="flex-1">
          <Label>Booking code</Label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SH-ABC123" />
        </div>
        <Button type="submit">Track</Button>
      </form>

      <div className="mt-8 max-w-lg">
        {isLoading && <Spinner />}
        {error && <p className="text-sm text-destructive">No order found with that code.</p>}
        {data && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{data.service_name}</CardTitle>
                <Badge className="bg-primary/10 text-primary">
                  {ORDER_STATUS_LABEL[data.status as keyof typeof ORDER_STATUS_LABEL] ?? data.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.order_code} · {data.scheduled_date} · {data.scheduled_slot}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.events.map((e, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    <div>
                      <p>{e.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
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
