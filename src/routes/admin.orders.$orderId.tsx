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
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Input, Label, OrderRowSkeleton, Spinner } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderAddonType, type OrderDetail, type OrderStatus, type PaymentMethod } from "@/types";
import { formatDateTime, formatDate, inr } from "@/lib/format";
import { errorMessage } from "@/lib/api";
import { telHref, waHref } from "@/lib/contact";
import { normalizePhone, parseAmount, parseQuantity, bookingDateSchema, phoneSchema, pincodeSchema } from "@/lib/validation";
import { useToast } from "@/components/ui/Toast";

export const Route = createFileRoute("/admin/orders/$orderId")({
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchAdminOrder(orderId),
    meta: { silent: true },
  });

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [reference, setReference] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [addonType, setAddonType] = useState<OrderAddonType>("60min");
  const [addonPrice, setAddonPrice] = useState("");
  const [addonQuantity, setAddonQuantity] = useState("1");
  const [addonError, setAddonError] = useState<string | null>(null);

  const { data: staffList = [] } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaff,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-order", orderId] });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => setOrderStatus(orderId, status),
    onSuccess: (_data, status) => {
      toast.success(`Status updated`, `Order moved to "${ORDER_STATUS_LABEL[status]}".`);
      invalidate();
    },
    onError: (err) => toast.error("Could not update status", errorMessage(err)),
    meta: { silent: true },
  });

  const paymentMutation = useMutation({
    mutationFn: (payload: { amount: number; method: PaymentMethod; reference: string | null }) =>
      recordPayment(orderId, {
        amount: payload.amount,
        method: payload.method,
        reference: payload.reference,
        status: "received",
      }),
    onSuccess: (_data, vars) => {
      setAmount("");
      setReference("");
      setAmountError(null);
      toast.success("Payment recorded", `${inr(vars.amount)} via ${vars.method}.`);
      invalidate();
    },
    onError: (err) => toast.error("Could not record payment", errorMessage(err)),
    meta: { silent: true },
  });

  function submitPayment() {
    const value = parseAmount(amount);
    if (value === null) {
      setAmountError("Enter an amount greater than ₹0.");
      return;
    }
    setAmountError(null);
    paymentMutation.mutate({ amount: value, method, reference: reference.trim() || null });
  }

  const addonMutation = useMutation({
    mutationFn: (payload: { price: number; quantity: number }) =>
      addOrderAddon(orderId, addonType, payload.price, payload.quantity),
    onSuccess: (_data, vars) => {
      setAddonPrice("");
      setAddonQuantity("1");
      setAddonError(null);
      toast.success("Add-on added", `${vars.quantity} × ${addonType === "30min" ? "30 min" : "60 min"} (${inr(vars.price)}).`);
      invalidate();
    },
    onError: (err) => toast.error("Could not add add-on", errorMessage(err)),
    meta: { silent: true },
  });

  function submitAddon() {
    const price = parseAmount(addonPrice);
    if (price === null) {
      setAddonError("Enter a price greater than ₹0.");
      return;
    }
    setAddonError(null);
    addonMutation.mutate({ price, quantity: parseQuantity(addonQuantity) });
  }

  const [assignStaffId, setAssignStaffId] = useState("");
  const assignMutation = useMutation({
    mutationFn: () => assignStaffToOrder(orderId, assignStaffId),
    onSuccess: () => {
      setAssignStaffId("");
      toast.success("Staff assigned", "The assignment is now on the order.");
      invalidate();
    },
    onError: (err) => toast.error("Could not assign staff", errorMessage(err)),
    meta: { silent: true },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <OrderRowSkeleton />
        <OrderRowSkeleton />
        <OrderRowSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link to="/admin/orders" search={{ status: undefined }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
          ← Orders
        </Link>
        <ErrorState
          className="mt-6"
          title="Couldn't load this order"
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold">Order not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been removed, or the link is out of date.
        </p>
        <Link to="/admin/orders" search={{ status: undefined }} className="mt-4 inline-block">
          <Button variant="outline">Back to orders</Button>
        </Link>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];
  const activeStaff = staffList.filter((s) => s.status === "active");

  return (
    <div>
      <Link to="/admin/orders" search={{ status: undefined }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Orders</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{order.service_name}</h1>
        <Badge className="bg-primary/10 text-primary">{order.order_code}</Badge>
        <Badge className="bg-accent/10 text-accent">{order.payment_summary}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.customer_name} · +{order.customer_phone}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Customer & address */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Service:</span> {order.service_name}</p>
            <p><span className="text-muted-foreground">Schedule:</span> {formatDate(order.scheduled_date)} · {order.scheduled_slot}</p>
            <p><span className="text-muted-foreground">Address:</span> {order.street}, {order.area}, {order.city} {order.pincode}</p>
            <p><span className="text-muted-foreground">Source:</span> <span className="capitalize">{order.source}</span></p>
            {order.description && <p><span className="text-muted-foreground">Notes:</span> {order.description}</p>}
            {order.estimated_hours && (
              <p><span className="text-muted-foreground">Estimate:</span> {order.estimated_hours} hrs</p>
            )}
            {order.amount != null && <p><span className="text-muted-foreground">Amount:</span> {inr(order.amount)}</p>}
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
              {order.status === "cancelled" && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  This order was cancelled.
                </p>
              )}
            </div>
            {nextStatus && (
              <Button
                className="w-full"
                onClick={() => statusMutation.mutate(nextStatus)}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                Move to {ORDER_STATUS_LABEL[nextStatus]}
              </Button>
            )}
            <div className="flex gap-2">
              <a
                href={telHref(order.customer_phone)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
              >
                Call customer
              </a>
              <a
                href={waHref(
                  order.customer_phone,
                  `Hi ${order.customer_name}, about your ${order.service_name} booking (${order.order_code}) — `,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
              >
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order edit form sits in its own card so it can reset on order refresh */}
      <OrderEditForm key={order.updated_at} order={order} onSaved={invalidate} />

      {/* Staff Assignment */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Assign staff</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48">
              <Label htmlFor="assign-staff">Staff member</Label>
              <select
                id="assign-staff"
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select staff</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} — {s.specializations || "General"}
                  </option>
                ))}
              </select>
              {activeStaff.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No active staff yet — add team members under Staff first.
                </p>
              )}
            </div>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={!assignStaffId || assignMutation.isPending}
            >
              {assignMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
              Assign
            </Button>
          </div>
          {order.staff_assignments && order.staff_assignments.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground">Assigned staff:</p>
              {order.staff_assignments.map((a) => (
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
              <Label htmlFor="addon-type">Type</Label>
              <select
                id="addon-type"
                value={addonType}
                onChange={(e) => setAddonType(e.target.value as OrderAddonType)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="30min">30 minutes</option>
                <option value="60min">60 minutes</option>
              </select>
            </div>
            <div>
              <Label htmlFor="addon-price">Price (₹)</Label>
              <Input
                id="addon-price"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={addonPrice}
                onChange={(e) => {
                  setAddonPrice(e.target.value);
                  setAddonError(null);
                }}
                placeholder="Amount"
                aria-invalid={Boolean(addonError)}
              />
            </div>
            <div>
              <Label htmlFor="addon-qty">Quantity</Label>
              <Input
                id="addon-qty"
                type="number"
                min="1"
                max="20"
                value={addonQuantity}
                onChange={(e) => setAddonQuantity(e.target.value)}
              />
            </div>
            <Button onClick={submitAddon} disabled={!addonPrice || addonMutation.isPending}>
              {addonMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
              Add
            </Button>
          </div>
          {addonError && (
            <p role="alert" className="mt-2 text-sm text-destructive">{addonError}</p>
          )}
          {order.addons.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              {order.addons.map((addon) => (
                <div key={addon.id} className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                  <span>{addon.quantity} × {addon.addon_type === "30min" ? "30 min" : "60 min"}</span>
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
              <Label htmlFor="payment-amount">Amount (₹)</Label>
              <Input
                id="payment-amount"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(null);
                }}
                placeholder="0"
                aria-invalid={Boolean(amountError)}
              />
              {amountError && (
                <p role="alert" className="mt-1 text-xs text-destructive">{amountError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="payment-method">Method</Label>
              <select
                id="payment-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <Label htmlFor="payment-ref">Reference (optional)</Label>
              <Input
                id="payment-ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="UPI ref / note"
                maxLength={120}
              />
            </div>
            <Button onClick={submitPayment} disabled={!amount || paymentMutation.isPending}>
              {paymentMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
              Record payment
            </Button>
          </div>
          {order.payments.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground">Recorded payments:</p>
              {order.payments.map((p) => (
                <div key={p.id} className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                  <span>
                    {inr(p.amount)} · {p.method}
                    {p.reference ? ` · ${p.reference}` : ""}
                  </span>
                  <span className="text-xs font-semibold text-accent">
                    {p.status === "received" ? "Received" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
        <CardContent>
          {order.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                  <span>{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function OrderEditForm({ order, onSaved }: { order: OrderDetail; onSaved: () => void }) {
  const toast = useToast();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (patch: Record<string, unknown>) => updateOrder(order.id, patch),
    onSuccess: () => {
      toast.success("Order updated", "Your changes are saved.");
      setErrors({});
      onSaved();
    },
    onError: (err) => {
      toast.error("Could not save changes", errorMessage(err));
    },
    meta: { silent: true },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (customerName.trim().length < 2) fieldErrors.customer_name = "Enter the customer's name";
    if (!phoneSchema.safeParse(customerPhone).success)
      fieldErrors.customer_phone = "Enter a valid 10-digit mobile number";
    if (!bookingDateSchema.safeParse(date).success)
      fieldErrors.scheduled_date = "Pick a valid date (today up to 90 days out)";
    if (!slot) fieldErrors.scheduled_slot = "Choose a time slot";
    if (street.trim().length < 3) fieldErrors.street = "Enter the house / flat / street";
    if (area.trim().length < 2) fieldErrors.area = "Enter the area";
    if (!pincodeSchema.safeParse(pincode).success) fieldErrors.pincode = "Enter a 6-digit pincode";
    if (finalAmount && parseAmount(finalAmount) === null)
      fieldErrors.amount = "Enter an amount greater than ₹0, or leave it empty";
    if (estimatedHours && (Number(estimatedHours) <= 0 || Number(estimatedHours) > 24))
      fieldErrors.estimated_hours = "Estimate must be between 0.5 and 24 hours";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.warning("Check the highlighted fields", "Some details need correcting before saving.");
      return;
    }

    mutation.mutate({
      customer_name: customerName.trim(),
      customer_phone: normalizePhone(customerPhone),
      scheduled_date: date,
      scheduled_slot: slot,
      street: street.trim(),
      area: area.trim(),
      pincode,
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
      amount: finalAmount ? parseAmount(finalAmount) : null,
      description: notes.trim() || null,
    });
  }

  const err = (field: string) =>
    errors[field] ? (
      <p role="alert" className="mt-1 text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <Card className="mt-6 lg:col-span-2">
      <CardHeader><CardTitle>Edit order</CardTitle></CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div>
            <Label htmlFor="edit-name">Customer name</Label>
            <Input
              id="edit-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              aria-invalid={Boolean(errors.customer_name)}
            />
            {err("customer_name")}
          </div>
          <div>
            <Label htmlFor="edit-phone">Customer phone</Label>
            <Input
              id="edit-phone"
              inputMode="numeric"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
              aria-invalid={Boolean(errors.customer_phone)}
            />
            {err("customer_phone")}
          </div>
          <div>
            <Label htmlFor="edit-date">Date</Label>
            <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={Boolean(errors.scheduled_date)} />
            {err("scheduled_date")}
          </div>
          <div>
            <Label htmlFor="edit-slot">Time slot</Label>
            <Input id="edit-slot" value={slot} onChange={(e) => setSlot(e.target.value)} aria-invalid={Boolean(errors.scheduled_slot)} />
            {err("scheduled_slot")}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-street">Address</Label>
            <Input id="edit-street" value={street} onChange={(e) => setStreet(e.target.value)} aria-invalid={Boolean(errors.street)} />
            {err("street")}
          </div>
          <div>
            <Label htmlFor="edit-area">Area</Label>
            <Input id="edit-area" value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={Boolean(errors.area)} />
            {err("area")}
          </div>
          <div>
            <Label htmlFor="edit-pincode">Pincode</Label>
            <Input
              id="edit-pincode"
              inputMode="numeric"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-invalid={Boolean(errors.pincode)}
            />
            {err("pincode")}
          </div>
          <div>
            <Label htmlFor="edit-hours">Estimated hours</Label>
            <Input id="edit-hours" type="number" step="0.5" min="0.5" max="24" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} aria-invalid={Boolean(errors.estimated_hours)} />
            {err("estimated_hours")}
          </div>
          <div>
            <Label htmlFor="edit-amount">Final amount (₹)</Label>
            <Input id="edit-amount" type="number" min="1" step="1" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} aria-invalid={Boolean(errors.amount)} />
            {err("amount")}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-notes">Internal / customer notes</Label>
            <Input id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
