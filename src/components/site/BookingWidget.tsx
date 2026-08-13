import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";
import { z } from "zod";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOps, saveOrder } from "@/lib/ops-store";
import {
  CATEGORY_LABEL,
  TIME_SLOTS,
  buildUpiUri,
  inr,
  newOrderId,
  todayISO,
  type ServiceCategory,
} from "@/lib/booking";

const addressSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name").max(60),
  street: z.string().trim().min(5, "Enter your house / street").max(120),
  area: z.string().trim().min(2, "Select your area"),
  pincode: z.string().trim().regex(/^46\d{4}$/, "Enter a valid Bhopal pincode (462xxx)"),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  whatsapp: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number"),
  society: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(300).optional(),
});

const STEPS = ["Service", "Schedule", "Address", "Pay by UPI"];
const CATEGORIES: ServiceCategory[] = ["express", "packages", "addons"];

export function BookingWidget({ preselectServiceId }: { preselectServiceId?: string } = {}) {
  const navigate = useNavigate();
  const { services, areas } = useOps();
  const liveServices = services.filter((s) => s.active);
  const servicingAreas = areas.filter((a) => a.servicing);

  const [step, setStep] = useState(0);
  const preselected = preselectServiceId
    ? services.find((s) => s.id === preselectServiceId)
    : undefined;
  const [category, setCategory] = useState<ServiceCategory>(preselected?.category ?? "express");
  const [serviceId, setServiceId] = useState(preselected?.id ?? "housekeeping");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(TIME_SLOTS[2]!);
  const [customerName, setCustomerName] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [society, setSociety] = useState("");
  const [floor, setFloor] = useState("Ground");
  const [lift, setLift] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId] = useState(() => newOrderId());
  const [qr, setQr] = useState<string>("");
  const [paying, setPaying] = useState(false);

  const service = useMemo(
    () => liveServices.find((s) => s.id === serviceId) ?? liveServices[0],
    [liveServices, serviceId],
  );
  const amount = service?.price ?? 399;

  const upiUri = useMemo(() => buildUpiUri({ id: orderId, amount }), [orderId, amount]);

  useEffect(() => {
    if (step !== 3) return;
    QRCode.toDataURL(upiUri, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [step, upiUri]);

  useEffect(() => {
    if (!area && servicingAreas[0]) setArea(servicingAreas[0].name);
  }, [area, servicingAreas]);

  function onAreaChange(next: string) {
    setArea(next);
    const match = areas.find((a) => a.name === next);
    if (match) setPincode(match.pincode);
  }

  function goToPayment() {
    const parsed = addressSchema.safeParse({
      customerName,
      street,
      area,
      pincode,
      mobile,
      whatsapp: sameWhatsapp ? mobile : whatsapp,
      society,
      notes,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setStep(3);
  }

  function confirmPayment() {
    if (!service) return;
    setPaying(true);
    // Simulated UPI payment response callback. Order is confirmed only on success.
    window.setTimeout(() => {
      saveOrder({
        id: orderId,
        serviceId: service.id,
        serviceName: service.name,
        durationMins: service.durationMins,
        amount: service.price,
        date,
        slot,
        street,
        area,
        pincode,
        mobile,
        customerName,
        whatsapp: sameWhatsapp ? mobile : whatsapp,
        society,
        floor,
        lift,
        notes,
        status: "paid",
        paidAt: Date.now(),
        upiRef: "UPI" + Math.random().toString().slice(2, 14),
      });
      navigate({ to: "/track/$orderId", params: { orderId } });
    }, 1600);
  }

  return (
    <section id="book" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[var(--shadow-float)]">
        <div className="border-b border-border bg-secondary/50 px-5 py-4">
          <h2 className="font-display text-xl font-bold md:text-2xl">Instant booking</h2>
          <ol className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`rounded-full px-3 py-1 transition ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-accent-soft text-accent"
                      : "bg-background text-muted-foreground"
                }`}
              >
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="p-5">
          {step === 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                      category === c
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {liveServices
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        serviceId === s.id
                          ? "border-primary bg-primary-soft/50 ring-2 ring-primary/40"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <p className="truncate text-sm font-bold">{s.name}</p>
                        <span className="shrink-0 text-sm font-extrabold text-primary">
                          {inr(s.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-accent">
                        {s.durationMins >= 60
                          ? `${Math.round((s.durationMins / 60) * 10) / 10} hrs`
                          : `${s.durationMins} mins`}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{s.blurb}</p>
                      <ul className="mt-3 space-y-1">
                        {s.includes.map((inc) => (
                          <li
                            key={inc}
                            className="flex items-center gap-1.5 text-[11px] text-foreground/80"
                          >
                            <Check className="h-3 w-3 shrink-0 text-accent" /> {inc}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="date">Pick a date</Label>
                <Input
                  id="date"
                  type="date"
                  min={todayISO()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <span className="text-sm font-medium">Pick a slot</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSlot(t)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        slot === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={customerName}
                  maxLength={60}
                  placeholder="Ananya Sharma"
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-2"
                />
                {errors['customerName'] && (
                  <p className="mt-1 text-xs text-destructive">{errors['customerName']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  placeholder="98765 43210"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="mt-2"
                />
                {errors['mobile'] && <p className="mt-1 text-xs text-destructive">{errors['mobile']}</p>}
              </div>
              <div className="md:col-span-2 grid gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={sameWhatsapp}
                    onChange={(e) => setSameWhatsapp(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  WhatsApp number is the same as my mobile number
                </label>
                {!sameWhatsapp && (
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      inputMode="numeric"
                      maxLength={10}
                      value={whatsapp}
                      placeholder="98765 43210"
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                      className="mt-2"
                    />
                    {errors['whatsapp'] && (
                      <p className="mt-1 text-xs text-destructive">{errors['whatsapp']}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="street">House / Street</Label>
                <Input
                  id="street"
                  value={street}
                  maxLength={120}
                  placeholder="Flat 302, Sagar Green Hills"
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-2"
                />
                {errors['street'] && <p className="mt-1 text-xs text-destructive">{errors['street']}</p>}
              </div>
              <div>
                <Label htmlFor="area">Area / Locality</Label>
                <select
                  id="area"
                  value={area}
                  onChange={(e) => onAreaChange(e.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {servicingAreas.map((a) => (
                    <option key={a.name}>{a.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Only areas currently staffed are listed.
                </p>
              </div>
              <div>
                <Label htmlFor="pincode">Bhopal Pincode</Label>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  placeholder="462011"
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="mt-2"
                />
                {errors['pincode'] && <p className="mt-1 text-xs text-destructive">{errors['pincode']}</p>}
              </div>
              <div>
                <Label htmlFor="society">Society / Building name</Label>
                <Input
                  id="society"
                  value={society}
                  maxLength={80}
                  placeholder="Sagar Green Hills"
                  onChange={(e) => setSociety(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <select
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {["Ground", "1st", "2nd", "3rd", "4th or above"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={lift}
                    onChange={(e) => setLift(e.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  Lift available
                </label>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Special notes (heavy dirt, pets, parking)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  maxLength={300}
                  rows={3}
                  placeholder="Kitchen has heavy grease, please bring extra degreaser."
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border p-5 text-center">
                <p className="text-sm font-semibold">Scan to pay {inr(amount)}</p>
                {qr ? (
                  <img
                    src={qr}
                    alt={`UPI QR code to pay ${inr(amount)} for booking ${orderId}`}
                    width={220}
                    height={220}
                    className="mx-auto mt-3 h-[220px] w-[220px] rounded-xl border border-border"
                  />
                ) : (
                  <div className="mx-auto mt-3 grid h-[220px] w-[220px] place-items-center rounded-xl bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  UPI ID: sparklehome@ybl · Ref {orderId}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {["PhonePe", "Google Pay", "Paytm", "BHIM UPI"].map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-bold text-foreground/70"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Or pay with your UPI app</p>
                <div className="mt-3 grid gap-2">
                  {(
                    [
                      ["PhonePe", "phonepe"],
                      ["Google Pay", "gpay"],
                      ["Paytm", "paytm"],
                      ["Other UPI app", undefined],
                    ] as const
                  ).map(([label, app]) => (
                    <a
                      key={label}
                      href={buildUpiUri({ id: orderId, amount }, app)}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:border-primary"
                    >
                      {label}
                      <span className="text-xs font-medium text-muted-foreground">Open app</span>
                    </a>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-accent" /> Payment-first confirmation
                  </p>
                  <p className="mt-1">
                    Your booking is confirmed only after we receive a successful UPI payment
                    response. Failed or cancelled payments are never charged.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-secondary/40 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {service?.name} · {date} · {slot}
            </p>
            <p className="font-display text-lg font-extrabold text-primary">{inr(amount)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold"
              >
                Back
              </button>
            )}
            {step < 2 && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full bg-[image:var(--gradient-cta)] px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Continue
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={goToPayment}
                className="rounded-full bg-[image:var(--gradient-cta)] px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Pay {inr(amount)}
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={paying}
                onClick={confirmPayment}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-70"
              >
                {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                {paying ? "Verifying payment" : "I've paid"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
