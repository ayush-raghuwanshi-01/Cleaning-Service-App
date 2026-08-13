import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, MapPin, Navigation, Phone, Wallet } from "lucide-react";
import { STATUS_LABEL, inr, mapsLink, todayISO } from "@/lib/booking";
import { setOrderStatus, useOps } from "@/lib/ops-store";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "My Jobs Today | SparkleHome Cleaner App" },
      {
        name: "description",
        content:
          "Lightweight cleaner app for SparkleHome Bhopal staff: today's jobs, directions, arrival updates, 2-hour timer and earnings.",
      },
      { property: "og:title", content: "My Jobs Today | SparkleHome Cleaner App" },
      {
        property: "og:description",
        content: "Field app for Bhopal cleaners — schedule, one-tap job actions and daily earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffPage,
});

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function StaffPage() {
  const { orders, employees } = useOps();
  const [employeeId, setEmployeeId] = useState("EMP01");
  const [now, setNow] = useState(Date.now());
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const me = employees.find((e) => e.id === employeeId);
  const myJobs = Object.values(orders)
    .filter((o) => o.employeeId === employeeId)
    .sort((a, b) => a.slot.localeCompare(b.slot));
  const activeJobs = myJobs.filter((o) => o.status !== "completed");
  const doneToday = myJobs.filter((o) => o.status === "completed" && o.date === todayISO());
  const earnedToday = doneToday.reduce((sum, o) => sum + Math.round(o.amount * 0.4), 0);

  function onPhoto(orderId: string, file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOrderStatus(orderId, "completed", { proofPhoto: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-base font-bold">My Jobs Today</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {me ? `${me.name} · ${me.area}` : "Select cleaner"}
            </p>
          </div>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="h-9 max-w-[9rem] rounded-xl border border-input bg-background px-2 text-xs"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <div className="rounded-2xl bg-primary-soft p-4">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <p className="mt-1 font-display text-2xl font-extrabold text-primary">
            {doneToday.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Jobs done today</p>
        </div>
        <div className="rounded-2xl bg-accent-soft p-4">
          <Wallet className="h-4 w-4 text-accent" />
          <p className="mt-1 font-display text-2xl font-extrabold text-accent">
            {inr(earnedToday)}
          </p>
          <p className="text-[11px] text-muted-foreground">Earned today (40%)</p>
        </div>
      </div>

      <main className="space-y-4 px-4">
        {activeJobs.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active jobs assigned. Ask dispatch to assign you from the{" "}
            <Link to="/admin" className="font-semibold text-primary">
              admin panel
            </Link>
            .
          </p>
        )}

        {activeJobs.map((job) => {
          const remaining = job.startedAt
            ? job.startedAt + job.durationMins * 60_000 - now
            : job.durationMins * 60_000;
          return (
            <article key={job.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {job.slot}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {STATUS_LABEL[job.status]}
                </span>
              </div>
              <p className="mt-2 text-base font-bold">{job.customerName || "Customer"}</p>
              <p className="text-xs text-muted-foreground">
                {job.serviceName} · {inr(job.amount)}
              </p>
              <p className="mt-2 flex gap-2 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {job.street}, {job.area}, Bhopal {job.pincode}
                </span>
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:+91${job.mobile}`}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-bold"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={mapsLink(job)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-bold"
                >
                  <Navigation className="h-4 w-4" /> Directions
                </a>
              </div>

              {job.status === "in_progress" && (
                <div className="mt-3 rounded-xl bg-[image:var(--gradient-cta)] p-3 text-center text-primary-foreground">
                  <p className="text-[11px] font-semibold uppercase opacity-80">Job timer</p>
                  <p className="font-display text-3xl font-extrabold tabular-nums">
                    {fmt(remaining)}
                  </p>
                </div>
              )}

              <div className="mt-3 space-y-2">
                {job.status === "assigned" && (
                  <button
                    type="button"
                    onClick={() => setOrderStatus(job.id, "on_the_way")}
                    className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground"
                  >
                    I'm on the way
                  </button>
                )}
                {job.status === "on_the_way" && (
                  <button
                    type="button"
                    onClick={() => setOrderStatus(job.id, "in_progress")}
                    className="h-14 w-full rounded-2xl bg-[image:var(--gradient-cta)] text-base font-bold text-primary-foreground"
                  >
                    I have arrived — Start Cleaning
                  </button>
                )}
                {job.status === "in_progress" && (
                  <>
                    <input
                      ref={(el) => {
                        fileRefs.current[job.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => onPhoto(job.id, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[job.id]?.click()}
                      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-accent-foreground"
                    >
                      <Camera className="h-5 w-5" /> Complete Job & Upload Photo
                    </button>
                  </>
                )}
                {job.status === "paid" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Waiting for dispatch confirmation.
                  </p>
                )}
              </div>
            </article>
          );
        })}

        {doneToday.length > 0 && (
          <section>
            <h2 className="mt-2 text-sm font-bold">Completed today</h2>
            <ul className="mt-2 space-y-2">
              {doneToday.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs"
                >
                  <span className="truncate font-semibold">
                    {job.customerName} · {job.area}
                  </span>
                  <span className="font-bold text-accent">
                    +{inr(Math.round(job.amount * 0.4))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
