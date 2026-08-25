import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchServices, fetchServiceAreas } from "@/lib/services-api";
import { createOrder } from "@/lib/orders-api";
import { TIME_SLOTS } from "@/lib/config";
import { todayISO, inr, durationLabel, formatDate } from "@/lib/format";
import { Button, ErrorState, Input, Label } from "@/components/ui";
import { ServiceGridSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { serviceImage } from "@/lib/service-images";
import {
  bookingAddressSchema,
  isBhopalPincode,
  maxBookingDateISO,
  zodFieldErrors,
} from "@/lib/validation";
import { ApiError } from "@/lib/api";

/** 3 steps max: Service → Schedule → Address & Confirm. */
const STEPS = ["Service", "Schedule", "Address & Confirm"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

export function BookingWidget({ preselectServiceId }: { preselectServiceId?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    meta: { silent: true },
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas"],
    queryFn: fetchServiceAreas,
  });

  const liveServices = useMemo(() => (services ?? []).filter((s) => s.is_active), [services]);
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
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const effectiveServiceId = serviceId || preselectServiceId || liveServices[0]?.id || "";
  const service = liveServices.find((s) => s.id === effectiveServiceId);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast.success(
        "Booking requested!",
        `Your code is ${order.order_code}. We'll call to confirm your slot.`,
      );
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Please check your connection and try again.";
      toast.error("Could not place booking", msg);
    },
    meta: { silent: true },
  });

  function validateStep(current: number): boolean {
    const e: Record<string, string> = {};
    if (current === 0) {
      if (!service) e.service = "Choose a service to continue";
    }
    if (current === 1) {
      if (!date || date < todayISO()) e.date = "Pick today or a future date";
      if (!slot) e.slot = "Choose a time slot";
    }
    if (current === 2) {
      const parsed = bookingAddressSchema.safeParse({
        street,
        area,
        pincode,
        floor: floor || undefined,
        landmark: landmark || undefined,
        description: notes || undefined,
      });
      if (!parsed.success) Object.assign(e, zodFieldErrors(parsed.error));
      else if (!isBhopalPincode(pincode))
        e.pincode = "We currently serve Bhopal only (pincodes starting with 46)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step < STEPS.length - 1 && validateStep(step)) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (!service || !validateStep(2)) return;
    createOrderMutation.mutate({
      service_id: service.id,
      scheduled_date: date,
      scheduled_slot: slot,
      street: street.trim(),
      area: area.trim(),
      pincode,
      floor: floor.trim() || null,
      landmark: landmark.trim() || null,
      description: notes.trim() || null,
    });
  }

  return (
    <section id="book" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-lift">
        {/* Progress header */}
        <div className="border-b border-border bg-gradient-to-r from-brand-50 to-white px-5 py-5 md:px-8">
          <h2 className="font-display text-xl font-bold md:text-2xl">Book your clean</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            3 quick steps — no online payment needed. Pay by UPI or cash after the work.
          </p>
          <ol className="mt-4 flex items-center gap-2 text-xs font-semibold" aria-label="Booking progress">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                    <span className="hidden sm:inline">{s}</span>
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className={`h-px w-4 sm:w-8 ${done ? "bg-accent" : "bg-border"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 md:p-8">
          {!isAuthenticated ? (
            <div className="py-10 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-primary">
                <PhoneCall className="h-7 w-7" />
              </span>
              <p className="mt-4 text-lg font-bold">Log in to place your booking</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                A free account lets you track your booking and re-book in one tap.
                It takes 30 seconds — just name, mobile number and password.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button size="lg" onClick={() => navigate({ to: "/register" })}>
                  Create free account
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: "/login" })}>
                  Log in
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STEP 1 — Service */}
              {step === 0 && (
                <div>
                  {servicesLoading ? (
                    <ServiceGridSkeleton count={6} />
                  ) : servicesError ? (
                    <ErrorState
                      title="Couldn't load our services"
                      description="We can't reach the service catalogue right now. Retry — or call us and we'll book you in directly."
                      error={servicesError}
                      onRetry={() => refetchServices()}
                    />
                  ) : liveServices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                      <p className="text-sm font-semibold">No services available right now</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Please call us — we'll book you in directly.
                      </p>
                    </div>
                  ) : (
                    categoryOrder.map((cat) => {
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
                                  onClick={() => {
                                    setServiceId(s.id);
                                    setErrors((c) => ({ ...c, service: "" }));
                                  }}
                                  aria-pressed={selected}
                                  className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 ${
                                    selected
                                      ? "border-primary ring-2 ring-primary/20"
                                      : "border-border hover:border-primary/40"
                                  }`}
                                >
                                  <div className="relative h-28 w-full overflow-hidden">
                                    <img
                                      src={serviceImage(s.id, s.name)}
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
                                      <Clock className="h-3 w-3" /> {durationLabel(s.duration_minutes)} ·
                                      from {inr(s.base_price)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {errors.service && (
                    <p className="text-sm text-destructive">{errors.service}</p>
                  )}
                </div>
              )}

              {/* STEP 2 — Schedule */}
              {step === 1 && (
                <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">
                      <CalendarDays className="mr-1 inline h-4 w-4" /> Preferred date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      min={todayISO()}
                      max={maxBookingDateISO()}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setErrors((c) => ({ ...c, date: "" }));
                      }}
                    />
                    {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
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
                  <div className="sm:col-span-2">
                    <p className="rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                      <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                      We confirm staff availability, exact scope and the final amount on a
                      quick call before work starts. No advance payment.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3 — Address & Confirm */}
              {step === 2 && (
                <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_20rem]">
                  {/* Address form */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="street">House / flat / street</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="B-42, Shivaji Nagar"
                        autoComplete="street-address"
                      />
                      {errors.street && <p className="mt-1 text-xs text-destructive">{errors.street}</p>}
                    </div>
                    <div>
                      <Label htmlFor="area">Area / locality</Label>
                      <Input
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="MP Nagar"
                      />
                      {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        inputMode="numeric"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setErrors((c) => ({ ...c, pincode: "" }));
                        }}
                        placeholder="462011"
                        maxLength={6}
                      />
                      {errors.pincode ? (
                        <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">Bhopal pincodes start with 46</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="floor">Floor (optional)</Label>
                      <Input
                        id="floor"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="2nd floor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="landmark">Landmark (optional)</Label>
                      <Input
                        id="landmark"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near DB Mall"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="notes">Anything we should know? (optional)</Label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={4000}
                        placeholder="e.g. 2BHK, focus on kitchen and 2 bathrooms, one friendly dog"
                        className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      />
                    </div>

                    {areas.filter((a) => a.is_active).length > 0 && (
                      <div className="sm:col-span-2">
                        <Label>Quick-fill serviced areas</Label>
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
                                  setErrors((c) => ({ ...c, area: "", pincode: "" }));
                                }}
                                className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
                              >
                                {a.name} · {a.pincode}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sticky summary + confirm */}
                  <aside className="h-fit rounded-2xl border border-border bg-secondary/40 p-5 lg:sticky lg:top-24">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Your booking
                    </h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        {service && (
                          <img
                            src={serviceImage(service.id, service.name)}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-bold">{service?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            from {service ? inr(service.base_price) : "—"}
                          </p>
                        </div>
                      </div>
                      <p className="flex items-center gap-2 border-t border-border pt-3">
                        <CalendarDays className="h-4 w-4 text-accent" />
                        {formatDate(date)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        {slot}
                      </p>
                      <p className="flex items-start gap-2 border-t border-border pt-3 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span>
                          {[street, area, pincode].filter(Boolean).join(", ") || "Enter your address"}
                        </span>
                      </p>
                    </div>
                    <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                      Final amount is confirmed on call before work starts. Pay by UPI or
                      cash after the job — no advance needed.
                    </p>
                  </aside>
                </div>
              )}

              {/* Footer nav */}
              <div className="flex items-center justify-between border-t border-border pt-5">
                <Button variant="ghost" disabled={step === 0} onClick={back}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button size="lg" onClick={next}>
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleSubmit} disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Placing booking…
                      </>
                    ) : (
                      "Confirm booking request"
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
