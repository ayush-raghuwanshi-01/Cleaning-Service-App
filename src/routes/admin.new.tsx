import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAdminOrder } from "@/lib/admin-api";
import { fetchServices } from "@/lib/services-api";
import { fetchServiceAreas } from "@/lib/services-api";
import { TIME_SLOTS } from "@/lib/config";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
} from "@/components/ui";
import { todayISO } from "@/lib/format";
import type { OrderSource } from "@/types";

export const Route = createFileRoute("/admin/new")({
  component: AdminNewOrder,
});

function AdminNewOrder() {
  const navigate = useNavigate();
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas"],
    queryFn: fetchServiceAreas,
  });

  const activeAreas = areas.filter((a) => a.is_active);

  const [source, setSource] = useState<OrderSource>("phone");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: createAdminOrder,
    onSuccess: (order) =>
      navigate({
        to: "/admin/orders/$orderId",
        params: { orderId: order.id },
      }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      source,
      customer_name: customerName,
      customer_phone: customerPhone,
      service_id: serviceId,
      scheduled_date: date,
      scheduled_slot: slot,
      street,
      area,
      pincode,
      description: notes || null,
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
      amount: amount ? Number(amount) : null,
    });
  }

  function handleAreaSelect(areaName: string, areaPincode: string) {
    setArea(areaName);
    setPincode(areaPincode);
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
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label>Source</Label>
              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value as OrderSource)
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
              </select>
            </div>
            <div>
              <Label>Service</Label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Select service</option>
                {services
                  .filter((s) => s.is_active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label>Customer name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Customer phone</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                required
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Time slot</Label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                required
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / street"
                required
              />
            </div>
            <div>
              <Label>Area</Label>
              <select
                value={area}
                onChange={(e) => {
                  const selected = activeAreas.find(
                    (a) => a.name === e.target.value,
                  );
                  if (selected) {
                    handleAreaSelect(selected.name, selected.pincode);
                  } else {
                    setArea(e.target.value);
                  }
                }}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                required
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
              {activeAreas.length === 0 && (
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / locality"
                  className="mt-2"
                  required
                />
              )}
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                value={pincode}
                onChange={(e) =>
                  setPincode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                maxLength={6}
                required
              />
            </div>
            <div>
              <Label>Estimated hours (optional)</Label>
              <Input
                type="number"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <Label>Amount (optional)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1200"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Requirements gathered on call"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : "Create order"}
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Could not create order. Please check the details.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}