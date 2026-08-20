import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { createUser, fetchUsers, resetUserPassword, updateUser } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const ROLES: UserRole[] = ["OWNER", "ADMIN", "OPERATIONS", "STAFF", "CUSTOMER"];

function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const [creating, setCreating] = useState(false);

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUser(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast("Role updated", "success");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateUser(id, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast("Account updated", "success");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Team & users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who can log in to the admin dashboard and what they can do.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center"><Spinner /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone / email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">
                    {u.full_name}
                    {u.id === me?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{u.phone ?? "—"}</div>
                    <div className="text-xs">{u.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={u.id === me?.id}
                      onClick={() => activeMutation.mutate({ id: u.id, is_active: !u.is_active })}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                        u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        const pw = prompt(`Set a new password for ${u.full_name} (min 12 chars):`);
                        if (pw && pw.length >= 12) {
                          resetUserPassword(u.id, pw)
                            .then(() => toast("Password reset", "success"))
                            .catch((e) => toast(errorMessage(e), "error"));
                        } else if (pw !== null) {
                          toast("Password must be at least 12 characters", "error");
                        }
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Reset password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && <CreateUserForm onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    role: "STAFF" as UserRole,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createUser({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        password: form.password,
        role: form.role,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast("User created", "success");
      onClose();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Add user</CardTitle>
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
            <Label>Email (optional)</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Password (min 12 chars)</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <Label>Role</Label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !form.full_name.trim() || !form.phone.trim() || form.password.length < 12}
            >
              {mutation.isPending ? <Spinner /> : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
