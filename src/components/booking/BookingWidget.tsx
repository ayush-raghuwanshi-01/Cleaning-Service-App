import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchServices, fetchServiceAreas } from "@/lib/services-api";
import { fetchAddresses } from "@/lib/addresses-api";
import { createOrder } from "@/lib/orders-api";
import { errorMessage } from "@/lib/api";
import { toast } from "@/lib/toast";
import { TIME_SLOTS } from "@/lib/config";
import { todayISO, inr, durationLabel } from "@/lib/format";
import { Button, Input, Label } from "@/components/ui";
import { serviceImage } from "@/lib/service-images";

const STEPS = ["Service", "Schedule", "Address", "Review", "Confirm"];

const CATEGORY_LABEL: Record<string, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

export function BookingWidget({ preselectServiceId }: { preselectServiceId?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateProfile } = useAuth();

  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const { data: areas = [] } = useQuery({ queryKey: ["service-areas"], queryFn: fetchServiceAreas });
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  });

  const liveServices = useMemo(() => services.filter((s) => s.is_active), [services]);
  const categoryOrder = useMemo(
    () => ["express", "packages", "addons"].filter((c) => liveServices.some((s) => s.category === c)),
    [liveServices],
  );

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(preselectServiceId ?? "");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [floor, setFloor] = useState("");
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const effectiveServiceId = serviceId || preselectServiceId || liveServices[0]?.id || "";
  const service = liveServices.find((s) => s.id === effectiveServiceId);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast("Booking request submitted!", "success");
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    },
    onError: (err) => toast(errorMessage(err, "Could not place the order."), "error"),
  });

  async function savePhone() {
    if (phone.length < 10) return;
    setSavingPhone(true);
    try {
      await updateProfile({ phone });
      toast("Phone number saved", "success");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSavingPhone(false);
    }
  }

  function canGoNext(): boolean {
    if (step === 0) return Boolean(service);
    if (step === 1) return Boolean(date && slot);
    if (step === 2) {
      const e: Record<string, string> = {};
      if (!street.trim()) e.street = "Enter your house / street";
      if (!area.trim()) e.area = "Enter your area";
      if (!/^\d{6}$/.test(pincode)) e.pincode = "Enter a valid 6-digit pincode";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  }

  function next() {
    if (step < STEPS.length - 1 && canGoNext()) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

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
    <section id="book" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-xl shadow-slate-200/70">
        <div className="border-b border-border bg-secondary/50 px-5 py-5 md:px-8">
          <h2 className="font-display text-xl font-bold md:text-2xl">Request a booking</h2>
          <ol className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={s}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-accent/10 text-accent"
                        : "bg-background text-muted-foreground"
                  }`}
                >
                  {done && <Check className="h-3 w-3" />}
                  {i + 1}. {s}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 md:p-8">
          {!isAuthenticated ? (
            <div className="py-10 text-center">
              <p className="text-lg font-bold">Log in to place an order</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a free account so we can track your booking.
              </p>
              <div className="mt-6 flex justify-center gap-3">
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
                  {categoryOrder.map((cat) => {
                    const list = liveServices.filter((s) => s.category === cat);
                    if (!list.length) return null;
                    return (
                      <div key={cat} className="mb-6 last:mb-0">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                          {CATEGORY_LABEL[cat] ?? cat}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {list.map((s) => {
                            const selected = effectiveServiceId === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setServiceId(s.id)}
                                className={`group overflow-hidden rounded-2xl border text-left transition ${
                                  selected
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                <div className="relative h-28 w-full overflow-hidden">
                                  <img
                                    src={serviceImage(s.id)}
                                    alt={s.name}
                                    className="h-full w-full object-cover"
                                  />
                                  {selected && (
                                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                                      <Check className="h-4 w-4" />
                                    </span>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="text-sm font-bold">{s.name}</p>
                                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" /> {durationLabel(s.duration_minutes)} · from{" "}
                                    {inr(s.base_price)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Preferred date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      min={todayISO()}
                      onChange={(e) => setDate(e.target.value)}
                    />
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
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    We will confirm staff availability, exact scope and final amount before work starts.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
                  {user && !user.phone && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 sm:col-span-2">
                      <Label htmlFor="booking-phone">Your mobile number (required to book)</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="booking-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="9876543210"
                          maxLength={10}
                        />
                        <Button type="button" onClick={savePhone} disabled={phone.length < 10 || savingPhone}>
                          {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {savedAddresses.length > 0 && (
                    <div className="sm:col-span-2">
                      <Label>Saved addresses</Label>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {savedAddresses.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setStreet(a.line1);
                              setArea(a.city);
                              setPincode(a.pincode);
                              setFloor(a.landmark ?? "");
                              setErrors({});
                            }}
                            className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            {a.label}: {a.line1}, {a.city} {a.pincode}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <Label htmlFor="street">House / street</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="House number, street, building"
                    />
                    {errors.street && <p className="mt-1 text-xs text-destructive">{errors.street}</p>}
                  </div>
                  <div>
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Area / locality"
                    />
                    {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="462011"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="floor">Floor / landmark (optional)</Label>
                    <Input
                      id="floor"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="2nd floor, nearby landmark"
                    />
                  </div>
                  {areas.length > 0 && (
                    <div className="sm:col-span-2">
                      <Label>Serviced areas</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {areas
                          .filter((a) => a.is_active)
                          .map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setArea(a.name);
                                setPincode(a.pincode);
                                setErrors((current) => ({ ...current, area: "", pincode: "" }));
                              }}
                              className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
                            >
                              {a.name} · {a.pincode}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="mx-auto max-w-2xl space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Service</span>
                    <span className="flex items-center gap-2 font-semibold">
                      <img
                        src={service ? serviceImage(service.id) : ""}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover"
                      />
                      {service?.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-semibold">{date} · {slot}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{service ? durationLabel(service.duration_minutes) : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="max-w-[60%] text-right font-semibold">
                      {street}, {area}, {pincode}
                    </span>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-2xl bg-primary/10 p-5 text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-white">
                      <PhoneCall className="h-6 w-6" />
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold">Ready to request booking</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                      Our team will call you to confirm availability, cleaning requirements and the final price.
                      You can pay by <strong>UPI or cash after the work is done</strong> — no online payment needed.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                      <ShieldCheck className="h-4 w-4" /> Verified background · Transparent pricing
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-5">
                <Button variant="ghost" disabled={step === 0} onClick={back}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={next}>
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm my booking"
                    )}
                  </Button>
                )}
              </div>

              {createOrderMutation.isError && (
                <p className="text-sm text-destructive">Could not place the order. Please try again.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
