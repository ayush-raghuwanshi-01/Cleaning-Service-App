import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Phone, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cancelOrder, fetchOrder, rescheduleOrder } from "@/lib/orders-api";
import { errorMessage } from "@/lib/api";
import { toast } from "@/lib/toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageLoader, Spinner } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderStatus } from "@/types";
import { formatDateTime, todayISO } from "@/lib/format";
import { TIME_SLOTS } from "@/lib/config";

export const Route = createFileRoute("/orders/$orderId")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: OrderDetailPage,
});

const RESCHEDULABLE: OrderStatus[] = ["requested", "contacted", "confirmed"];

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { user, updateProfile } = useAuth();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: Boolean(user),
  });

  // Phone-collection for Google users who haven't added one yet.
  const [phone, setPhone] = useState("");
  const [addingPhone, setAddingPhone] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      toast("Booking cancelled", "success");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  if (isLoading) return <PageLoader />;
  if (!order) {
    return (
      <AppLayout>
        <p className="py-16 text-center text-muted-foreground">Order not found.</p>
      </AppLayout>
    );
  }

  const currentIndex = Math.max(0, ORDER_STATUS_FLOW.indexOf(order.status));
  const reschedulable = RESCHEDULABLE.includes(order.status);
  const cancellable = !["completed", "cancelled"].includes(order.status);

  return (
    <AppLayout>
      <Link to="/orders" className="text-xs font-semibold text-muted-foreground">← My orders</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{ORDER_STATUS_LABEL[order.status]}</h1>
        <Badge className="bg-primary/10 text-primary">{order.order_code}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.service_name} · {order.scheduled_date} · {order.scheduled_slot}
      </p>

      {/* Phone required (Google sign-in users) */}
      {user && !user.phone && (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <CardContent className="pt-5">
            <p className="text-sm font-semibold text-amber-800">
              Add your phone number so we can confirm your bookings.
            </p>
            <form
              className="mt-3 flex flex-wrap items-end gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setAddingPhone(true);
                try {
                  await updateProfile({ phone });
                  toast("Phone number saved", "success");
                } catch (err) {
                  toast(errorMessage(err), "error");
                } finally {
                  setAddingPhone(false);
                }
              }}
            >
              <div>
                <Label>Mobile number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" maxLength={10} required />
              </div>
              <Button type="submit" disabled={phone.length < 10 || addingPhone}>
                {addingPhone ? <Spinner /> : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <ol className="mt-8 space-y-1">
        {ORDER_STATUS_FLOW.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={stage} className="flex items-start gap-4">
              <span
                className={`mt-1 h-3 w-3 rounded-full ${done ? "bg-accent" : active ? "bg-primary" : "bg-border"}`}
              />
              <span className={`text-sm ${done || active ? "font-semibold" : "text-muted-foreground"}`}>
                {ORDER_STATUS_LABEL[stage]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Service address</CardTitle></CardHeader>
          <CardContent>
            <p className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{order.street}, {order.area}, {order.city} {order.pincode}</span>
            </p>
            {order.customer_phone && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-accent" /> {order.customer_phone}
              </p>
            )}
            {order.assigned_staff?.length > 0 && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 shrink-0 text-accent" />
                {order.assigned_staff.map((s) => s.full_name).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.payment_summary}</p>
            {order.amount && (
              <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                ₹{order.amount}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reschedule / cancel */}
      {(reschedulable || cancellable) && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Manage booking</CardTitle></CardHeader>
          <CardContent>
            {reschedulable && (
              <RescheduleForm orderId={order.id} />
            )}
            {cancellable && (
              <Button
                variant="danger"
                className="mt-4"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (confirm("Cancel this booking? This cannot be undone.")) cancelMutation.mutate();
                }}
              >
                {cancelMutation.isPending ? <Spinner /> : "Cancel booking"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity timeline */}
      {order.events.length > 0 && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Order activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                  <span className="text-foreground/85">{e.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}

function RescheduleForm({ orderId }: { orderId: string }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);

  const mutation = useMutation({
    mutationFn: () => rescheduleOrder(orderId, { scheduled_date: date, scheduled_slot: slot }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      toast("Booking rescheduled", "success");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold">Reschedule</p>
      <form
        className="mt-3 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <Label>New date</Label>
          <Input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label>New slot</Label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {TIME_SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner /> : "Reschedule"}
        </Button>
      </form>
    </div>
  );
}
