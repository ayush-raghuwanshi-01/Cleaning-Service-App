import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrderAddon,
  fetchAdminOrder,
  fetchStaff,
  assignStaffToOrder,
  recordPayment,
  setOrderStatus,
  updateOrder,
} from "@/lib/admin-api";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageLoader, Spinner } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderAddonType, type OrderDetail, type OrderStatus, type PaymentMethod } from "@/types";
import { formatDateTime, inr } from "@/lib/format";
import { ApiError } from "@/lib/api";

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
  const [addonType, setAddonType] = useState<OrderAddonType>("60min");
  const [addonPrice, setAddonPrice] = useState("");
  const [addonQuantity, setAddonQuantity] = useState("1");

  const { data: staffList = [] } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaff,
  });

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
    mutationFn: () => addOrderAddon(orderId, addonType, Number(addonPrice), Number(addonQuantity || 1)),
    onSuccess: () => {
      setAddonPrice("");
      setAddonQuantity("1");
      invalidate();
    },
  });

  const markStartedMutation = useMutation({
    mutationFn: () => updateOrder(orderId, { started_at: new Date().toISOString() }),
    onSuccess: invalidate,
  });

  const [assignStaffId, setAssignStaffId] = useState("");
  const assignMutation = useMutation({
    mutationFn: () => assignStaffToOrder(orderId, assignStaffId),
    onSuccess: () => {
      setAssignStaffId("");
      invalidate();
    },
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

        <OrderEditForm key={order.updated_at} order={order} onSaved={invalidate} />

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
            <div className="flex gap-2">
              <a
                href={`tel:${order.customer_phone}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Call customer
              </a>
              <a
                href={`https://wa.me/${order.customer_phone.startsWith("+") ? order.customer_phone.slice(1) : order.customer_phone.startsWith("91") ? order.customer_phone : "91" + order.customer_phone}?text=Hi ${order.customer_name}, your ${order.service_name} booking (${order.order_code})`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Assignment */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Assign Staff</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48">
              <Label>Staff member</Label>
              <select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select staff</option>
                {staffList
                  .filter((s) => s.status === "active")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} — {s.specializations || "General"}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={!assignStaffId || assignMutation.isPending}
            >
              {assignMutation.isPending ? <Spinner /> : "Assign"}
            </Button>
          </div>
          {order.staff_assignments && order.staff_assignments.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground">Assigned staff:</p>
              {order.staff_assignments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                  <span>{a.staff_name || a.staff_id}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.completed_at ? "Completed" : a.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Add extra time</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label>Type</Label>
              <select value={addonType} onChange={(e) => setAddonType(e.target.value as OrderAddonType)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="30min">30 minutes</option>
                <option value="60min">60 minutes</option>
              </select>
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={addonPrice} onChange={(e) => setAddonPrice(e.target.value)} placeholder="Amount" />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" min="1" value={addonQuantity} onChange={(e) => setAddonQuantity(e.target.value)} />
            </div>
            <Button onClick={() => addonMutation.mutate()} disabled={!addonPrice || addonMutation.isPending}>
              {addonMutation.isPending ? <Spinner /> : "Add"}
            </Button>
          </div>
          {addonMutation.isError && <p className="mt-2 text-sm text-destructive">{errorMessage(addonMutation.error)}</p>}
          {order.addons.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              {order.addons.map((addon) => (
                <div key={addon.id} className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                  <span>{addon.quantity} × {addon.addon_type}</span>
                  <span className="font-semibold">{inr(addon.price)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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


function OrderEditForm({ order, onSaved }: { order: OrderDetail; onSaved: () => void }) {
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [customerPhone, setCustomerPhone] = useState(order.customer_phone);
  const [date, setDate] = useState(order.scheduled_date);
  const [slot, setSlot] = useState(order.scheduled_slot);
  const [street, setStreet] = useState(order.street);
  const [area, setArea] = useState(order.area);
  const [pincode, setPincode] = useState(order.pincode);
  const [estimatedHours, setEstimatedHours] = useState(order.estimated_hours?.toString() ?? "");
  const [finalAmount, setFinalAmount] = useState(order.amount?.toString() ?? "");
  const [notes, setNotes] = useState(order.description ?? "");

  const mutation = useMutation({
    mutationFn: () => updateOrder(order.id, {
      customer_name: customerName,
      customer_phone: customerPhone,
      scheduled_date: date,
      scheduled_slot: slot,
      street,
      area,
      pincode,
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
      amount: finalAmount ? Number(finalAmount) : null,
      description: notes || null,
    }),
    onSuccess: onSaved,
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Edit order</CardTitle></CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label>Customer name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <Label>Customer phone</Label>
            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <Label>Time slot</Label>
            <Input value={slot} onChange={(e) => setSlot(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} required />
          </div>
          <div>
            <Label>Area</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} required />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
          </div>
          <div>
            <Label>Estimated hours</Label>
            <Input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
          </div>
          <div>
            <Label>Final amount</Label>
            <Input type="number" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Internal/customer notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {mutation.isError && <p className="text-sm text-destructive sm:col-span-2">{errorMessage(mutation.error)}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Spinner /> : "Save changes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Operation failed. Please check the details and try again.";
}
