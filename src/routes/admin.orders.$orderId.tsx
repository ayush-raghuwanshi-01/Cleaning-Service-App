import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrderAddon,
  fetchAdminOrder,
  recordPayment,
  setOrderStatus,
  updateOrder,
} from "@/lib/admin-api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageLoader } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderStatus, type PaymentMethod } from "@/types";
import { formatDateTime, inr } from "@/lib/format";

export const Route = createFileRoute("/admin/orders/$orderId")({
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchAdminOrder(orderId),
  });

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [reference, setReference] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-order", orderId] });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => setOrderStatus(orderId, status),
    onSuccess: invalidate,
  });

  const paymentMutation = useMutation({
    mutationFn: () =>
      recordPayment(orderId, {
        amount: Number(amount),
        method,
        reference: reference || null,
        status: "received",
      }),
    onSuccess: () => {
      setAmount("");
      setReference("");
      invalidate();
    },
  });

  const addonMutation = useMutation({
    mutationFn: () => addOrderAddon(orderId, "60min", 80),
    onSuccess: invalidate,
  });

  const markStartedMutation = useMutation({
    mutationFn: () => updateOrder(orderId, { started_at: new Date().toISOString() }),
    onSuccess: invalidate,
  });

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="text-muted-foreground">Order not found.</p>;

  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];

  return (
    <div>
      <Link to="/admin/orders" className="text-xs font-semibold text-muted-foreground">← Orders</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{order.service_name}</h1>
        <Badge className="bg-primary/10 text-primary">{order.order_code}</Badge>
        <Badge className="bg-accent/10 text-accent">{order.payment_summary}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.customer_name} · {order.customer_phone}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Customer & address */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Service:</span> {order.service_name}</p>
            <p><span className="text-muted-foreground">Schedule:</span> {order.scheduled_date} · {order.scheduled_slot}</p>
            <p><span className="text-muted-foreground">Address:</span> {order.street}, {order.area}, {order.city} {order.pincode}</p>
            <p><span className="text-muted-foreground">Source:</span> {order.source}</p>
            {order.description && <p><span className="text-muted-foreground">Notes:</span> {order.description}</p>}
            {order.estimated_hours && (
              <p><span className="text-muted-foreground">Estimate:</span> {order.estimated_hours} hrs</p>
            )}
            {order.amount && <p><span className="text-muted-foreground">Amount:</span> {inr(order.amount)}</p>}
            {order.overtime_hours && (
              <p><span className="text-muted-foreground">Overtime:</span> {order.overtime_hours} hrs</p>
            )}
          </CardContent>
        </Card>

        {/* Status control */}
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {ORDER_STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${i <= currentIndex ? "bg-accent" : "bg-border"}`} />
                  <span className={i <= currentIndex ? "font-semibold" : "text-muted-foreground"}>
                    {ORDER_STATUS_LABEL[s]}
                  </span>
                </div>
              ))}
            </div>
            {nextStatus && (
              <Button
                className="w-full"
                onClick={() => statusMutation.mutate(nextStatus)}
                disabled={statusMutation.isPending}
              >
                Move to {ORDER_STATUS_LABEL[nextStatus]}
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => markStartedMutation.mutate()} disabled={markStartedMutation.isPending}>
              Mark started
            </Button>
            <Button variant="outline" className="w-full" onClick={() => addonMutation.mutate()} disabled={addonMutation.isPending}>
              Add 60-min add-on (₹80)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Record payment */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Record payment</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Method</Label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <Label>Reference (optional)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI ref / note" />
            </div>
            <Button onClick={() => paymentMutation.mutate()} disabled={!amount || paymentMutation.isPending}>
              Record payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {order.events.map((e) => (
              <li key={e.id} className="flex gap-3 text-sm">
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
