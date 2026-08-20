import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/admin-api";
import { Card } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { AuditLogEntry } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/audit-log")({
  component: AdminAuditLog,
});

function AdminAuditLog() {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track all actions performed in the system
      </p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Could not load audit logs. Make sure the backend is running.
          </p>
        ) : logs.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No audit logs recorded yet.
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 font-semibold text-muted-foreground">
                    Time
                  </th>
                  <th className="pb-2 pr-4 font-semibold text-muted-foreground">
                    Action
                  </th>
                  <th className="pb-2 pr-4 font-semibold text-muted-foreground">
                    Entity
                  </th>
                  <th className="pb-2 font-semibold text-muted-foreground">
                    Actor
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: AuditLogEntry) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-secondary/30"
                  >
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {log.entity_type} {log.entity_id.slice(0, 8)}…
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {log.actor_id ? log.actor_id.slice(0, 8) + "…" : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}