import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchServices, fetchServiceAreas } from "@/lib/services-api";
import { createOrder } from "@/lib/orders-api";
import { TIME_SLOTS } from "@/lib/config";
import { todayISO } from "@/lib/format";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";

const STEPS = ["Service", "Schedule", "Address", "Review"];

export function BookingWidget({ preselectServiceId }: { preselectServiceId?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  // fetchServiceAreas is kept available for the address step's area selector.
  void useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });

  const liveServices = useMemo(() => services.filter((s) => s.is_active), [services]);
  const serviceOptions = useMemo(
    () => [...new Set(liveServices.map((s) => s.category))],
    [liveServices],
  );

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(preselectServiceId ?? liveServices[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [floor, setFloor] = useState("");

  const service = liveServices.find((s) => s.id === serviceId);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate({ to: "/orders/$orderId", params: { orderId: order.id } }),
  });

  function handleSubmit() {
    if (!service) return;
    createOrderMutation.mutate({
      service_id: service.id,
      scheduled_date: date,
      scheduled_slot: slot,
      street,
      area,
      pincode,
      floor: floor || null,
    });
  }

  return (
    <section id="book" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-secondary/50">
          <CardTitle>Book a cleaning</CardTitle>
          <ol className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`rounded-full px-3 py-1 ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-accent/20 text-accent"
                      : "bg-background text-muted-foreground"
                }`}
              >
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        </CardHeader>

        <CardContent className="pt-5">
          {!isAuthenticated ? (
            <div className="py-8 text-center">
              <p className="text-lg font-semibold">Log in to place an order</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an account so we can track your booking.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button onClick={() => navigate({ to: "/login" })}>Log in</Button>
                <Button variant="outline" onClick={() => navigate({ to: "/register" })}>
                  Create account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 0 && (
                <div>
                  <Label>Choose a service</Label>
                  {serviceOptions.map((cat) => (
                    <div key={cat} className="mt-2">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {cat}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {liveServices
                          .filter((s) => s.category === cat)
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setServiceId(s.id)}
                              className={`rounded-xl border p-3 text-left text-sm transition ${
                                serviceId === s.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <span className="block font-bold">{s.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {s.duration_minutes / 60} hr · from ₹{s.base_price}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="slot">Time slot</Label>
                    <select
                      id="slot"
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="street">House / street</Label>
                    <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="House number, street, building" />
                  </div>
                  <div>
                    <Label htmlFor="area">Area</Label>
                    <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / locality" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="462011" maxLength={6} />
                  </div>
                  <div>
                    <Label htmlFor="floor">Floor (optional)</Label>
                    <Input id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="2nd" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-semibold">{service?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-semibold">{date} · {slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-semibold text-right">{street}, {area}, {pincode}</span>
                  </div>
                  <p className="pt-2 text-xs text-muted-foreground">
                    Final price is confirmed by our team on a call after we understand the work.
                    You can pay online or by cash after the service.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                {step < 3 ? (
                  <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? <Spinner /> : "Place order"}
                  </Button>
                )}
              </div>

              {createOrderMutation.isError && (
                <p className="text-sm text-destructive">
                  Could not place order. Please try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
