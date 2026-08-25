import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWhatsAppConfig, updateWhatsAppConfig } from "@/lib/admin-api";
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Input, Label, Skeleton, Spinner } from "@/components/ui";
import { errorMessage } from "@/lib/api";
import { whatsappSettingsSchema, zodFieldErrors } from "@/lib/validation";
import { useToast } from "@/components/ui/Toast";
import type { WhatsAppConfig } from "@/types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data: config, isLoading, error, refetch } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: fetchWhatsAppConfig,
    meta: { silent: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the WhatsApp contact details used for customer messages and staff dispatch.
      </p>

      {isLoading && (
        <Card className="mt-6 max-w-lg space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </Card>
      )}

      {error && (
        <ErrorState
          className="mt-6 max-w-lg"
          title="Couldn't load settings"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {config && <WhatsAppSettingsForm key={config.id} config={config} />}
    </div>
  );
}

function WhatsAppSettingsForm({ config }: { config: WhatsAppConfig }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [supportNumber, setSupportNumber] = useState(config.support_number);
  const [staffGroupLink, setStaffGroupLink] = useState(config.staff_group_link ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: { support_number: string; staff_group_link: string | null }) =>
      updateWhatsAppConfig(payload),
    onSuccess: () => {
      toast.success("Settings saved", "WhatsApp details updated across the app.");
      qc.invalidateQueries({ queryKey: ["whatsapp-config"] });
    },
    onError: (err) => {
      toast.error("Could not save settings", errorMessage(err));
    },
    meta: { silent: true },
  });

  function handleSave() {
    const parsed = whatsappSettingsSchema.safeParse({
      support_number: supportNumber,
      staff_group_link: staffGroupLink.trim(),
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      toast.warning("Check the highlighted fields", "Some details need correcting before saving.");
      return;
    }
    setErrors({});
    mutation.mutate({
      support_number: parsed.data.support_number,
      staff_group_link: parsed.data.staff_group_link || null,
    });
  }

  return (
    <Card className="mt-6 max-w-lg">
      <CardHeader><CardTitle>WhatsApp</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="wa-support">Support number</Label>
          <Input
            id="wa-support"
            inputMode="numeric"
            value={supportNumber}
            onChange={(e) => {
              setSupportNumber(e.target.value.replace(/\D/g, "").slice(0, 15));
              setErrors((c) => ({ ...c, support_number: "" }));
            }}
            placeholder="919876543210"
            aria-invalid={Boolean(errors.support_number)}
          />
          {errors.support_number ? (
            <p role="alert" className="mt-1 text-xs text-destructive">{errors.support_number}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              International digits, no “+” — this number receives customer messages.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="wa-group">Staff dispatch group link</Label>
          <Input
            id="wa-group"
            type="url"
            value={staffGroupLink}
            onChange={(e) => {
              setStaffGroupLink(e.target.value);
              setErrors((c) => ({ ...c, staff_group_link: "" }));
            }}
            placeholder="https://chat.whatsapp.com/..."
            aria-invalid={Boolean(errors.staff_group_link)}
          />
          {errors.staff_group_link && (
            <p role="alert" className="mt-1 text-xs text-destructive">{errors.staff_group_link}</p>
          )}
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
