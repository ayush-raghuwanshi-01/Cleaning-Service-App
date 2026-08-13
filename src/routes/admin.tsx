import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  BadgeIndianRupee,
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  inr,
  todayISO,
  type Order,
  type OrderStatus,
  type Service,
  type ServiceCategory,
} from "@/lib/booking";
import {
  assignEmployee,
  removeService,
  settlePayout,
  toggleArea,
  toggleDuty,
  upsertService,
  useOps,
} from "@/lib/ops-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Ops Command Center | SparkleHome Bhopal Admin" },
      {
        name: "description",
        content:
          "Dispatch cleaners, edit service pricing, manage the Bhopal roster and toggle area coverage from one live operations dashboard.",
      },
      { property: "og:title", content: "Ops Command Center | SparkleHome Bhopal Admin" },
      {
        property: "og:description",
        content: "Live booking feed, dispatch, pricing editor and cleaner payouts for Bhopal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["Bookings", "Catalog", "Roster", "Coverage"] as const;
type Tab = (typeof TABS)[number];

const FILTERS: { key: string; label: string; match: (o: Order) => boolean }[] = [
  { key: "dispatch", label: "Pending Dispatch", match: (o) => o.status === "paid" },
  {
    key: "active",
    label: "In Progress",
    match: (o) => ["assigned", "on_the_way", "in_progress"].includes(o.status),
  },
  { key: "done", label: "Completed", match: (o) => o.status === "completed" },
  { key: "all", label: "All Orders", match: () => true },
];

function AdminPage() {
  const { orders, employees, services, areas } = useOps();
  const [tab, setTab] = useState<Tab>("Bookings");
  const [filter, setFilter] = useState("dispatch");

  const list = useMemo(
    () =>
      Object.values(orders)
        .sort((a, b) => b.paidAt - a.paidAt)
        .filter(FILTERS.find((f) => f.key === filter)!.match),
    [orders, filter],
  );

  const all = Object.values(orders);
  const today = todayISO();
  const completedToday = all.filter((o) => o.status === "completed" && o.date === today).length;
  const revenue = all.reduce((sum, o) => sum + o.amount, 0);
  const onField = employees.filter((e) => e.onDuty).length;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-base font-bold">Ops Command Center</span>
              <span className="block text-[11px] text-muted-foreground">SparkleHome Bhopal</span>
            </span>
          </Link>
          <Link
            to="/staff"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          >
            Cleaner app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BadgeIndianRupee, label: "UPI collected", value: inr(revenue) },
            { icon: CheckCircle2, label: "Jobs completed today", value: String(completedToday) },
            { icon: Users, label: "Cleaners on field", value: String(onField) },
            { icon: Activity, label: "Live orders", value: String(all.length) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <Icon className="h-4 w-4 text-accent" />
              <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === "Bookings" && (
          <section className="mt-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    filter === f.key
                      ? "bg-accent-soft text-accent"
                      : "border border-border bg-card text-muted-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No orders in this view yet. Place a booking on the customer site to see it appear
                here instantly.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {list.map((o) => (
                  <article
                    key={o.id}
                    className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          {o.id}
                        </span>
                        <StatusPill status={o.status} />
                      </div>
                      <p className="mt-1 truncate text-sm font-bold">
                        {o.customerName || "Customer"} · {o.serviceName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.street}, {o.area} {o.pincode} · +91 {o.mobile}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">{inr(o.amount)} paid</p>
                      <p>
                        {o.date} · {o.slot}
                      </p>
                    </div>
                    <select
                      value={o.employeeId ?? ""}
                      onChange={(e) => assignEmployee(o.id, e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm md:w-56"
                    >
                      <option value="" disabled>
                        Assign cleaner…
                      </option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id} disabled={!e.onDuty}>
                          {e.name} · {e.area}
                          {e.onDuty ? "" : " (off duty)"}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Catalog" && <CatalogEditor services={services} />}

        {tab === "Roster" && (
          <section className="mt-4 grid gap-3">
            {employees.map((e) => (
              <article
                key={e.id}
                className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-bold">
                    {e.name}{" "}
                    <span className="text-xs font-medium text-muted-foreground">
                      · {e.area} · +91 {e.phone}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.jobsToday} jobs assigned today · payout balance{" "}
                    <span className="font-bold text-foreground">{inr(e.payoutBalance)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDuty(e.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      e.onDuty
                        ? "bg-accent-soft text-accent"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {e.onDuty ? "On duty" : "Off duty"}
                  </button>
                  <button
                    type="button"
                    onClick={() => settlePayout(e.id)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-bold"
                  >
                    Settle payout
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === "Coverage" && (
          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <button
                key={a.name}
                type="button"
                onClick={() => toggleArea(a.name)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  a.servicing ? "border-accent/40 bg-card" : "border-dashed border-border bg-muted"
                }`}
              >
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <MapPin className="h-4 w-4 text-accent" /> {a.name}
                  </span>
                  <span className="text-xs text-muted-foreground">Pincode {a.pincode}</span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    a.servicing ? "bg-accent-soft text-accent" : "bg-background text-muted-foreground"
                  }`}
                >
                  {a.servicing ? "Servicing" : "Paused"}
                </span>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === "completed"
      ? "bg-accent-soft text-accent"
      : status === "paid"
        ? "bg-primary-soft text-primary"
        : "bg-secondary text-foreground/70";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function CatalogEditor({ services }: { services: Service[] }) {
  const [draft, setDraft] = useState<Service | null>(null);

  function blank(): Service {
    return {
      id: "svc-" + Math.random().toString(36).slice(2, 7),
      category: "express",
      name: "",
      price: 399,
      durationMins: 120,
      blurb: "",
      includes: [],
      active: true,
    };
  }

  return (
    <section className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Service catalog & pricing</h2>
        <button
          type="button"
          onClick={() => setDraft(blank())}
          className="rounded-full bg-[image:var(--gradient-cta)] px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          + Add service
        </button>
      </div>

      {draft && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name.trim()) return;
            upsertService(draft);
            setDraft(null);
          }}
          className="mt-4 grid gap-3 rounded-2xl border border-primary/40 bg-card p-4 md:grid-cols-2"
        >
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Service name"
            maxLength={60}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          />
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft({ ...draft, category: e.target.value as ServiceCategory })
            }
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            {(Object.keys(CATEGORY_LABEL) as ServiceCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={49}
            max={99999}
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            placeholder="Price ₹"
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            min={15}
            max={600}
            value={draft.durationMins}
            onChange={(e) => setDraft({ ...draft, durationMins: Number(e.target.value) })}
            placeholder="Duration (mins)"
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          />
          <input
            value={draft.blurb}
            onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
            placeholder="Short description"
            maxLength={140}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground"
            >
              Save service
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border px-5 py-2 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 grid gap-3">
        {services.map((s) => (
          <article
            key={s.id}
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span className="truncate">{s.name}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {CATEGORY_LABEL[s.category]} · {s.durationMins} mins · {s.blurb}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-input px-2">
                <span className="text-xs text-muted-foreground">₹</span>
                <input
                  type="number"
                  min={49}
                  value={s.price}
                  onChange={(e) => upsertService({ ...s, price: Number(e.target.value) })}
                  className="h-9 w-20 bg-transparent text-sm font-bold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => upsertService({ ...s, active: !s.active })}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  s.active
                    ? "bg-accent-soft text-accent"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {s.active ? "Live" : "Disabled"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(s)}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeService(s.id)}
                className="rounded-full border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
