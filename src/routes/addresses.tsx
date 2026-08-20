import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { createAddress, deleteAddress, fetchAddresses, updateAddress, type AddressPayload } from "@/lib/addresses-api";
import { errorMessage } from "@/lib/api";
import { toast } from "@/lib/toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageLoader, Spinner } from "@/components/ui";
import type { Address } from "@/types";

export const Route = createFileRoute("/addresses")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: AddressesPage,
});

const EMPTY: AddressPayload = {
  label: "Home",
  recipient_name: "",
  recipient_phone: "",
  line1: "",
  line2: null,
  landmark: null,
  city: "",
  state: "Madhya Pradesh",
  pincode: "",
  is_default: false,
};

function AddressesPage() {
  const qc = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({ queryKey: ["addresses"], queryFn: fetchAddresses });
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast("Address deleted", "success");
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  if (isLoading) return <PageLoader />;

  return (
    <AppLayout>
      <Link to="/orders" className="text-xs font-semibold text-muted-foreground">← My orders</Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Saved addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick one when you book so you don't have to retype your address.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-muted-foreground">
          No saved addresses yet.
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className="flex items-start justify-between gap-3 p-4">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-bold">
                    {a.label}
                    {a.is_default && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Default</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </p>
                  {a.landmark && <p className="text-xs text-muted-foreground">Near {a.landmark}</p>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(a)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this address?")) deleteMutation.mutate(a.id);
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
        <AddressForm
          initial={editing ? { ...editing } : EMPTY}
          addressId={editing?.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </AppLayout>
  );
}

function AddressForm({ initial, addressId, onClose }: { initial: Address | AddressPayload; addressId?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<AddressPayload>({
    label: initial.label,
    recipient_name: initial.recipient_name,
    recipient_phone: initial.recipient_phone,
    line1: initial.line1,
    line2: initial.line2 ?? "",
    landmark: initial.landmark ?? "",
    city: initial.city,
    state: initial.state,
    pincode: initial.pincode,
    is_default: initial.is_default,
  });

  const set = (k: keyof AddressPayload, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload: AddressPayload = {
        ...form,
        line2: form.line2 || null,
        landmark: form.landmark || null,
      };
      return addressId ? updateAddress(addressId, payload) : createAddress(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast(addressId ? "Address updated" : "Address saved", "success");
      onClose();
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-h-[90vh] w-full max-w-md overflow-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{addressId ? "Edit address" : "Add address"}</CardTitle>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Home / Office" />
            </div>
            <div>
              <Label>Recipient phone</Label>
              <Input value={form.recipient_phone} onChange={(e) => set("recipient_phone", e.target.value)} placeholder="9876543210" />
            </div>
          </div>
          <div>
            <Label>Recipient name</Label>
            <Input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} />
          </div>
          <div>
            <Label>House / street</Label>
            <Input value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="House number, street" />
          </div>
          <div>
            <Label>Line 2 (optional)</Label>
            <Input value={form.line2 ?? ""} onChange={(e) => set("line2", e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </div>
          </div>
          <div>
            <Label>Landmark (optional)</Label>
            <Input value={form.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => set("is_default", e.target.checked)}
            />
            Set as default address
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.line1.trim() || !form.city.trim()}>
              {mutation.isPending ? <Spinner /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
