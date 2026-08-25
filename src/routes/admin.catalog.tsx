import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  createServiceArea,
  fetchAdminServiceAreas,
  fetchAdminServices,
  updateService,
  updateServiceArea,
  type ServiceAreaPayload,
  type ServicePayload,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Input, Label, OrderRowSkeleton, Spinner } from "@/components/ui";
import { durationLabel, inr } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import type { Service, ServiceArea } from "@/types";

export const Route = createFileRoute("/admin/catalog")({
  component: AdminCatalog,
});

const EMPTY_SERVICE: ServicePayload = {
  name: "",
  category: "express",
  description: null,
  blurb: null,
  base_price: 499,
  price_max: null,
  duration_minutes: 120,
  includes: [],
  excludes: [],
  addon_price_30min: null,
  addon_price_60min: null,
  overtime_grace_minutes: 15,
  is_active: true,
};

function AdminCatalog() {
  const [tab, setTab] = useState<"services" | "areas">("services");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the live services, prices, inclusions and service areas shown to customers.
          </p>
        </div>
        <div className="flex rounded-full bg-secondary p-1 text-xs font-semibold">
          <button
            onClick={() => setTab("services")}
            className={`rounded-full px-3 py-1.5 ${tab === "services" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Services
          </button>
          <button
            onClick={() => setTab("areas")}
            className={`rounded-full px-3 py-1.5 ${tab === "areas" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Areas
          </button>
        </div>
      </div>

      {tab === "services" ? <ServicesManager /> : <AreasManager />}
    </div>
  );
}

function ServicesManager() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-services"],
    queryFn: fetchAdminServices,
    meta: { silent: true },
  });
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (service: Service) =>
      updateService(service.id, { is_active: !service.is_active }),
    onSuccess: (_data, service) => {
      toast.success(
        service.is_active ? "Service hidden" : "Service is live",
        service.is_active
          ? `${service.name} no longer shows to customers.`
          : `${service.name} is now bookable on the website.`,
      );
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err) => toast.error("Could not update the service", errorMessage(err)),
    meta: { silent: true },
  });

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Services</CardTitle>
            <Button size="sm" onClick={() => setEditing("new")}>Add service</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <OrderRowSkeleton />
              <OrderRowSkeleton />
              <OrderRowSkeleton />
            </div>
          ) : error ? (
            <ErrorState
              compact
              title="Couldn't load the catalogue"
              error={error}
              onRetry={() => refetch()}
            />
          ) : (services ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No services yet. Add your first customer-facing service.</p>
          ) : (
            <div className="space-y-3">
               {(services ?? []).map((service) => (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setEditing(service)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditing(service);
                    }
                  }}
                  className="w-full cursor-pointer rounded-xl border border-border p-4 text-left transition hover:border-primary/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{service.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.category} · {durationLabel(service.duration_minutes)} · {service.is_active ? "Active" : "Hidden"}
                      </p>
                      {service.blurb && <p className="mt-2 text-sm text-muted-foreground">{service.blurb}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-sm font-extrabold text-primary">
                        {service.price_max ? `${inr(service.base_price)}–${inr(service.price_max)}` : inr(service.base_price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMutation.mutate(service);
                        }}
                        disabled={toggleMutation.isPending}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          service.is_active
                            ? "bg-accent/10 text-accent hover:bg-accent/20"
                            : "bg-secondary text-muted-foreground hover:bg-border"
                        }`}
                        title={service.is_active ? "Hide from customers" : "Show to customers"}
                      >
                        {service.is_active ? "● Live" : "○ Hidden"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceForm editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function ServiceForm({ editing, onClose }: { editing: Service | "new" | null; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const initial = editing && editing !== "new" ? toServicePayload(editing) : EMPTY_SERVICE;
  const [form, setForm] = useState<ServicePayload>(initial);
  const [includesText, setIncludesText] = useState((initial.includes ?? []).join("\n"));
  const [excludesText, setExcludesText] = useState((initial.excludes ?? []).join("\n"));
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = normalizeServicePayload({
        ...form,
        includes: lines(includesText),
        excludes: lines(excludesText),
      });
      return editing && editing !== "new" ? updateService(editing.id, payload) : createService(payload);
    },
    onSuccess: () => {
      toast.success(
        editing === "new" ? "Service added" : "Service updated",
        `${form.name || "The service"} is saved${form.is_active ? " and live on the website." : " (hidden from customers)."}`,
      );
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
    onError: (err) => {
      toast.error("Could not save the service", errorMessage(err));
    },
    meta: { silent: true },
  });

  /** Client-side sanity checks the backend would bounce anyway. */
  function validate(): string | null {
    if (!form.name.trim()) return "Enter a service name.";
    if (!Number.isFinite(form.duration_minutes) || form.duration_minutes < 15 || form.duration_minutes > 24 * 60)
      return "Duration must be between 15 minutes and 24 hours.";
    if (!Number.isFinite(form.base_price) || form.base_price < 0) return "Starting price can't be negative.";
    if (form.price_max != null && form.price_max < form.base_price)
      return "Max price must be at least the starting price.";
    if (form.addon_price_30min != null && form.addon_price_30min < 0) return "+30 min price can't be negative.";
    if (form.addon_price_60min != null && form.addon_price_60min < 0) return "+60 min price can't be negative.";
    if (!Number.isFinite(form.overtime_grace_minutes) || form.overtime_grace_minutes < 0)
      return "Grace minutes can't be negative.";
    return null;
  }

  if (!editing) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Select a service to edit pricing and customer-facing content, or add a new one.
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>{editing === "new" ? "Add service" : "Edit service"}</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const problem = validate();
            if (problem) {
              setFormError(problem);
              toast.warning("Check the form", problem);
              return;
            }
            setFormError(null);
            mutation.mutate();
          }}
        >
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="express">Express</option>
                <option value="packages">Packages</option>
                <option value="addons">Add-ons</option>
              </select>
            </div>
            <div>
              <Label>Duration minutes</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Starting price</Label>
              <Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} required />
            </div>
            <div>
              <Label>Max price optional</Label>
              <Input type="number" value={form.price_max ?? ""} onChange={(e) => setForm({ ...form, price_max: optionalNumber(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Short blurb</Label>
            <Input value={form.blurb ?? ""} onChange={(e) => setForm({ ...form, blurb: e.target.value || null })} maxLength={400} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value || null })}
              className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Includes one per line</Label>
            <textarea value={includesText} onChange={(e) => setIncludesText(e.target.value)} className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <Label>Excludes one per line</Label>
            <textarea value={excludesText} onChange={(e) => setExcludesText(e.target.value)} className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>+30 min</Label>
              <Input type="number" value={form.addon_price_30min ?? ""} onChange={(e) => setForm({ ...form, addon_price_30min: optionalNumber(e.target.value) })} />
            </div>
            <div>
              <Label>+60 min</Label>
              <Input type="number" value={form.addon_price_60min ?? ""} onChange={(e) => setForm({ ...form, addon_price_60min: optionalNumber(e.target.value) })} />
            </div>
            <div>
              <Label>Grace min</Label>
              <Input type="number" value={form.overtime_grace_minutes} onChange={(e) => setForm({ ...form, overtime_grace_minutes: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Show this service to customers
          </label>
          {formError && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Spinner /> : "Save"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AreasManager() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: areas, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-service-areas"],
    queryFn: fetchAdminServiceAreas,
    meta: { silent: true },
  });
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState("");
  const [areaError, setAreaError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createServiceArea({ name: name.trim(), pincode, is_active: true }),
    onSuccess: () => {
      toast.success("Service area added", `${name.trim()} (${pincode}) now appears across the app.`);
      setName("");
      setPincode("");
      setAreaError(null);
      qc.invalidateQueries({ queryKey: ["admin-service-areas"] });
      qc.invalidateQueries({ queryKey: ["service-areas"] });
    },
    onError: (err) => toast.error("Could not add the area", errorMessage(err)),
    meta: { silent: true },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setAreaError("Enter the area / locality name.");
      return;
    }
    if (pincode.length !== 6) {
      setAreaError("Pincode must be exactly 6 digits.");
      return;
    }
    setAreaError(null);
    createMutation.mutate();
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <Card>
        <CardHeader><CardTitle>Add service area</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate} noValidate>
            <div>
              <Label htmlFor="area-name">Area name</Label>
              <Input
                id="area-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setAreaError(null);
                }}
                placeholder="Area / locality"
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="area-pincode">Pincode</Label>
              <Input
                id="area-pincode"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setAreaError(null);
                }}
                placeholder="462011"
                maxLength={6}
              />
            </div>
            {areaError && (
              <p role="alert" className="text-sm text-destructive">{areaError}</p>
            )}
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
              Add area
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Service areas</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <OrderRowSkeleton />
              <OrderRowSkeleton />
              <OrderRowSkeleton />
            </div>
          ) : error ? (
            <ErrorState
              compact
              title="Couldn't load service areas"
              error={error}
              onRetry={() => refetch()}
            />
          ) : (areas ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No service areas yet. Add the localities you serve — customers see
              them while booking.
            </p>
          ) : (
            <div className="space-y-2">
              {(areas ?? []).map((area) => <AreaRow key={area.id} area={area} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AreaRow({ area }: { area: ServiceArea }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [draft, setDraft] = useState<ServiceAreaPayload>({
    name: area.name,
    pincode: area.pincode,
    is_active: area.is_active,
  });

  const mutation = useMutation({
    mutationFn: () => updateServiceArea(area.id, { ...draft, name: draft.name.trim() }),
    onSuccess: () => {
      toast.success("Area saved", `${draft.name} updated.`);
      qc.invalidateQueries({ queryKey: ["admin-service-areas"] });
      qc.invalidateQueries({ queryKey: ["service-areas"] });
    },
    onError: (err) => toast.error("Could not save the area", errorMessage(err)),
    meta: { silent: true },
  });

  function save() {
    if (draft.name.trim().length < 2) {
      toast.warning("Check the area name", "Enter the area / locality name.");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[minmax(0,1fr)_8rem_auto_auto] md:items-end">
      <div>
        <Label>Area</Label>
        <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={120} />
      </div>
      <div>
        <Label>Pincode</Label>
        <Input value={draft.pincode} onChange={(e) => setDraft({ ...draft, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" maxLength={6} />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
        <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
        Active
      </label>
      <Button size="sm" onClick={save} disabled={mutation.isPending || draft.pincode.length !== 6}>
        {mutation.isPending ? <Spinner className="h-4 w-4" /> : "Save"}
      </Button>
    </div>
  );
}

function toServicePayload(service: Service): ServicePayload {
  const { id: _id, ...payload } = service;
  void _id;
  return payload;
}

function normalizeServicePayload(payload: ServicePayload): ServicePayload {
  return {
    ...payload,
    includes: payload.includes?.length ? payload.includes : null,
    excludes: payload.excludes?.length ? payload.excludes : null,
    price_max: payload.price_max || null,
    addon_price_30min: payload.addon_price_30min ?? null,
    addon_price_60min: payload.addon_price_60min ?? null,
  };
}

function lines(value: string): string[] | null {
  const items = value.split("\n").map((line) => line.trim()).filter(Boolean);
  return items.length ? items : null;
}

function optionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Could not save. Please check the details and try again.";
}
