import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { createStaff, deleteStaff, fetchStaff, updateStaff, type StaffPayload } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import type { StaffMember } from "@/types";

export const Route = createFileRoute("/admin/staff")({
  component: AdminStaff,
});

const EMPTY: StaffPayload = {
  full_name: "",
  phone: "",
  skills: null,
  is_active: true,
};

function AdminStaff() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cleaners and field team dispatched to jobs. Assign them from any order.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add staff
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center"><Spinner /></div>
      ) : staff.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-muted-foreground">
          No staff yet. Add your first cleaner to start assigning jobs.
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id} className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold">
                  {s.full_name}
                  {!s.is_active && <span className="ml-2 text-xs font-medium text-muted-foreground">(inactive)</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {s.phone}
                </p>
                {s.skills && s.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.skills.map((sk) => (
                      <span key={sk} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">{sk}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(s)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${s.full_name}?`)) {
                      deleteStaff(s.id)
                        .then(() => {
                          qc.invalidateQueries({ queryKey: ["staff"] });
                          toast("Staff member deleted", "success");
                        })
                        .catch((e) => toast(errorMessage(e), "error"));
                    }
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <StaffForm
          initial={editing ? { full_name: editing.full_name, phone: editing.phone, skills: editing.skills, is_active: editing.is_active } : EMPTY}
          staffId={editing?.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function StaffForm({
  initial,
  staffId,
  onClose,
}: {
  initial: StaffPayload;
  staffId?: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<StaffPayload>(initial);
  const [skills, setSkills] = useState((initial.skills ?? []).join(", "));

  const mutation = useMutation({
    mutationFn: () => {
      const payload: StaffPayload = {
        ...form,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      return staffId ? updateStaff(staffId, payload) : createStaff(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      toast(staffId ? "Staff updated" : "Staff added", "success");
      onClose();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{staffId ? "Edit staff" : "Add staff"}</CardTitle>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
          </div>
          <div>
            <Label>Skills (comma separated, e.g. express, packages)</Label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="express, packages" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active (available for assignment)
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !form.full_name.trim() || !form.phone.trim()}
            >
              {mutation.isPending ? <Spinner /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
