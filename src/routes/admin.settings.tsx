import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWhatsAppConfig, updateWhatsAppConfig } from "@/lib/admin-api";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import type { WhatsAppConfig } from "@/types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: fetchWhatsAppConfig,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage WhatsApp contact details.</p>

      {isLoading && (
        <Card className="mt-6 max-w-lg p-6">
          <Spinner />
        </Card>
      )}

      {config && <WhatsAppSettingsForm key={config.id} config={config} />}
    </div>
  );
}

function WhatsAppSettingsForm({ config }: { config: WhatsAppConfig }) {
  const qc = useQueryClient();
  const [supportNumber, setSupportNumber] = useState(config.support_number);
  const [staffGroupLink, setStaffGroupLink] = useState(config.staff_group_link ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      updateWhatsAppConfig({
        support_number: supportNumber,
        staff_group_link: staffGroupLink || null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-config"] }),
  });

  return (
    <Card className="mt-6 max-w-lg">
      <CardHeader><CardTitle>WhatsApp</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Support number</Label>
          <Input value={supportNumber} onChange={(e) => setSupportNumber(e.target.value)} />
        </div>
        <div>
          <Label>Staff dispatch group link</Label>
          <Input
            value={staffGroupLink}
            onChange={(e) => setStaffGroupLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner /> : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}
