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
  Input,
  Label,
  Spinner,
} from "@/components/ui";
import type { StaffMember } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/staff")({
  component: AdminStaff,
});

function AdminStaff() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchStaff,
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specializations, setSpecializations] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createStaff({
        full_name: name,
        phone,
        email: email || null,
        specializations: specializations || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      setName("");
      setPhone("");
      setEmail("");
      setSpecializations("");
      setShowForm(false);
    },
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cleaners and team members
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add staff"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 max-w-lg">
          <CardHeader>
            <CardTitle>Add staff member</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
            >
              <div>
                <Label>Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Specializations</Label>
                <Input
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g. Deep cleaning, Kitchen"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner /> : "Save"}
              </Button>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  Could not add staff. Please check the details.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        {isLoading ? (
          <Spinner />
        ) : staff.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No staff members yet. Add your first cleaner.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s: StaffMember) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.phone}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
                  <span>{s.total_jobs} jobs</span>
                  {s.rating && <span>★ {s.rating.toFixed(1)}</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}