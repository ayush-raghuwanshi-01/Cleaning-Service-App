import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStaff, createStaff } from "@/lib/admin-api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  Label,
  OrderRowSkeleton,
  Spinner,
} from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { normalizePhone, staffSchema, zodFieldErrors } from "@/lib/validation";
import { useToast } from "@/components/ui/Toast";
import type { StaffMember } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/staff")({
  component: AdminStaff,
});

function AdminStaff() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: staff, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaff,
    meta: { silent: true },
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (payload: { full_name: string; phone: string; email: string | null; specializations: string | null }) =>
      createStaff(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      setName("");
      setPhone("");
      setEmail("");
      setSpecializations("");
      setErrors({});
      setShowForm(false);
      toast.success("Staff member added", `${vars.full_name} can now be assigned to orders.`);
    },
    onError: (err) => {
      toast.error("Could not add staff", errorMessage(err));
    },
    meta: { silent: true },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = staffSchema.safeParse({
      full_name: name,
      phone,
      email: email.trim(),
      specializations: specializations.trim(),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    createMutation.mutate({
      full_name: parsed.data.full_name,
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email ? parsed.data.email : null,
      specializations: parsed.data.specializations || null,
    });
  }

  const err = (field: string) =>
    errors[field] ? (
      <p role="alert" className="mt-1 text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cleaners and team members
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} aria-expanded={showForm}>
          {showForm ? "Cancel" : "Add staff"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-lg">
          <CardHeader>
            <CardTitle>Add staff member</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <Label htmlFor="staff-name">Full name</Label>
                <Input
                  id="staff-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.full_name)}
                />
                {err("full_name")}
              </div>
              <div>
                <Label htmlFor="staff-phone">Phone</Label>
                <Input
                  id="staff-phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.phone)}
                />
                {err("phone")}
              </div>
              <div>
                <Label htmlFor="staff-email">Email (optional)</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {err("email")}
              </div>
              <div>
                <Label htmlFor="staff-spec">Specializations</Label>
                <Input
                  id="staff-spec"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g. Deep cleaning, Kitchen"
                  maxLength={160}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            <OrderRowSkeleton />
            <OrderRowSkeleton />
            <OrderRowSkeleton />
          </div>
        ) : error ? (
          <ErrorState
            title="Couldn't load staff"
            error={error}
            onRetry={() => refetch()}
          />
        ) : (staff ?? []).length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm font-bold">No staff members yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add your cleaners here so you can assign them to jobs and track
              their completed work.
            </p>
            {!showForm && (
              <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                Add your first cleaner
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(staff ?? []).map((s: StaffMember) => (
              <Card key={s.id} className="p-4 transition hover:border-primary/40 hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">+{s.phone}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      s.status === "active"
                        ? "bg-accent/10 text-accent"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                {s.specializations && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.specializations}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>{s.total_jobs} job{s.total_jobs === 1 ? "" : "s"}</span>
                  {s.rating != null && <span>★ {s.rating.toFixed(1)}</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
