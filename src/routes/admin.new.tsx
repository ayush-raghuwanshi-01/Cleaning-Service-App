import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAdminOrder } from "@/lib/admin-api";
import { fetchServices, fetchServiceAreas } from "@/lib/services-api";
import { TIME_SLOTS } from "@/lib/config";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  Label,
  ServiceCardSkeleton,
  Spinner,
} from "@/components/ui";
import { todayISO } from "@/lib/format";
import {
  adminOrderSchema,
  maxBookingDateISO,
  normalizePhone,
  parseAmount,
  zodFieldErrors,
} from "@/lib/validation";
import { errorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { OrderSource } from "@/types";

export const Route = createFileRoute("/admin/new")({
  component: AdminNewOrder,
});

function AdminNewOrder() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: services, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    meta: { silent: true },
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas"],
    queryFn: fetchServiceAreas,
  });

  const activeAreas = areas.filter((a) => a.is_active);
  const activeServices = (services ?? []).filter((s) => s.is_active);

  const [source, setSource] = useState<OrderSource>("phone");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: createAdminOrder,
    onSuccess: (order) => {
      toast.success("Order created", `${order.order_code} is in the pipeline.`);
      navigate({
        to: "/admin/orders/$orderId",
        params: { orderId: order.id },
        search: { status: undefined },
      });
    },
    onError: (err) => {
      toast.error("Could not create the order", errorMessage(err));
    },
    meta: { silent: true },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = adminOrderSchema.safeParse({
      customer_name: customerName,
      customer_phone: customerPhone,
      service_id: serviceId,
      scheduled_date: date,
      scheduled_slot: slot,
      street,
      area,
      pincode,
    });
    const fieldErrors = parsed.success ? {} : zodFieldErrors(parsed.error);
    if (estimatedHours && (Number(estimatedHours) <= 0 || Number(estimatedHours) > 24)) {
      fieldErrors.estimated_hours = "Estimate must be between 0.5 and 24 hours";
    }
    if (amount && parseAmount(amount) === null) {
      fieldErrors.amount = "Enter an amount greater than ₹0, or leave it empty";
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.warning("Check the highlighted fields", "Some details need correcting before creating the order.");
      return;
    }

    setErrors({});
    mutation.mutate({
      source,
      customer_name: parsed.data!.customer_name,
      customer_phone: normalizePhone(parsed.data!.customer_phone),
      service_id: parsed.data!.service_id,
      scheduled_date: parsed.data!.scheduled_date,
      scheduled_slot: parsed.data!.scheduled_slot,
      street: parsed.data!.street,
      area: parsed.data!.area,
      pincode: parsed.data!.pincode,
      description: notes.trim() || null,
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
      amount: amount ? parseAmount(amount) : null,
    });
  }

  function handleAreaSelect(areaName: string, areaPincode: string) {
    setArea(areaName);
    setPincode(areaPincode);
    setErrors((c) => ({ ...c, area: "", pincode: "" }));
  }

  const err = (field: string) =>
    errors[field] ? (
      <p role="alert" className="mt-1 text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  if (servicesLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Add order</h1>
        <div className="mt-6 space-y-3">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">Add order</h1>
        <ErrorState
          className="mt-6"
          title="Couldn't load the service catalogue"
          description="We need the live service list to create an order. Try again, or check that the backend is running."
          error={servicesError}
          onRetry={() => refetchServices()}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Add order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Log an order from a phone call or WhatsApp message.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <Label htmlFor="new-source">Source</Label>
              <select
                id="new-source"
                value={source}
                onChange={(e) => setSource(e.target.value as OrderSource)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
              </select>
            </div>
            <div>
              <Label htmlFor="new-service">Service</Label>
              <select
                id="new-service"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setErrors((c) => ({ ...c, service_id: "" }));
                }}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                aria-invalid={Boolean(errors.service_id)}
              >
                <option value="">Select service</option>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {err("service_id")}
              {activeServices.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No active services — add services under Catalog first.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="new-name">Customer name</Label>
              <Input
                id="new-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(errors.customer_name)}
              />
              {err("customer_name")}
            </div>
            <div>
              <Label htmlFor="new-phone">Customer phone</Label>
              <Input
                id="new-phone"
                inputMode="numeric"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="9876543210"
                autoComplete="off"
                aria-invalid={Boolean(errors.customer_phone)}
              />
              {err("customer_phone")}
            </div>
            <div>
              <Label htmlFor="new-date">Date</Label>
              <Input
                id="new-date"
                type="date"
                value={date}
                min={todayISO()}
                max={maxBookingDateISO()}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={Boolean(errors.scheduled_date)}
              />
              {err("scheduled_date")}
            </div>
            <div>
              <Label htmlFor="new-slot">Time slot</Label>
              <select
                id="new-slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-street">Address</Label>
              <Input
                id="new-street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / street"
                aria-invalid={Boolean(errors.street)}
              />
              {err("street")}
            </div>
            <div>
              <Label htmlFor="new-area">Area</Label>
              <select
                id="new-area"
                value={area}
                onChange={(e) => {
                  const selected = activeAreas.find((a) => a.name === e.target.value);
                  if (selected) {
                    handleAreaSelect(selected.name, selected.pincode);
                  } else {
                    setArea(e.target.value);
                  }
                }}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                aria-invalid={Boolean(errors.area)}
              >
                <option value="">Select area</option>
                {activeAreas.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.pincode})
                  </option>
                ))}
                {area && !activeAreas.find((a) => a.name === area) && (
                  <option value={area}>{area} (custom)</option>
                )}
              </select>
              {err("area")}
              {activeAreas.length === 0 && (
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / locality"
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <Label htmlFor="new-pincode">Pincode</Label>
              <Input
                id="new-pincode"
                inputMode="numeric"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="462011"
                maxLength={6}
                aria-invalid={Boolean(errors.pincode)}
              />
              {err("pincode")}
            </div>
            <div>
              <Label htmlFor="new-hours">Estimated hours (optional)</Label>
              <Input
                id="new-hours"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="3"
                aria-invalid={Boolean(errors.estimated_hours)}
              />
              {err("estimated_hours")}
            </div>
            <div>
              <Label htmlFor="new-amount">Amount (optional, ₹)</Label>
              <Input
                id="new-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1200"
                aria-invalid={Boolean(errors.amount)}
              />
              {err("amount")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-notes">Notes</Label>
              <Input
                id="new-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Requirements gathered on call"
                maxLength={4000}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                Create order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
