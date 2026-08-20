import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDayStats, fetchDashboardAlerts } from "@/lib/admin-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { inr } from "@/lib/format";
import {
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import type { DashboardAlerts } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIPELINE_STEPS = [
  { key: "requested", label: "Requested", color: "bg-amber-100 text-amber-700" },
  { key: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  { key: "confirmed", label: "Confirmed", color: "bg-indigo-100 text-indigo-700" },
  { key: "in_progress", label: "In Progress", color: "bg-purple-100 text-purple-700" },
  { key: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
];

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchDayStats(),
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: fetchDashboardAlerts,
  });

  const todayStats = [
    {
      label: "Orders today",
      value: stats ? String(stats.orders) : "—",
      icon: Clock,
    },
    {
      label: "Completed",
      value: stats ? String(stats.completed_orders) : "—",
      icon: CheckCircle2,
    },
    {
      label: "Revenue",
      value: stats ? inr(stats.revenue) : "—",
      icon: DollarSign,
    },
    {
      label: "Staff",
      value: "—",
      icon: Users,
    },
  ];

  return (
    <div>
      {/* Alerts */}
      {alerts && (alerts.unassigned_jobs > 0 || alerts.overdue_payments > 0) && (
        <div className="mb-6 space-y-2">
          {alerts.unassigned_jobs > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                {alerts.unassigned_jobs} unassigned job
                {alerts.unassigned_jobs > 1 ? "s" : ""} today
              </span>
              <Link
                to="/admin/orders"
                className="ml-auto flex items-center gap-1 text-xs text-amber-700 underline"
              >
                View orders <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          {alerts.overdue_payments > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>
                {alerts.overdue_payments} overdue payment
                {alerts.overdue_payments > 1 ? "s" : ""}
              </span>
              <Link
                to="/admin/orders?status=completed"
                className="ml-auto flex items-center gap-1 text-xs text-red-700 underline"
              >
                View completed <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <PhoneCall className="h-4 w-4" /> Add Order
        </Link>
        <Link
          to="/admin/staff"
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/80"
        >
          <Users className="h-4 w-4" /> Manage Staff
        </Link>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {todayStats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-extrabold">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline / Kanban Board */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Order Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : alerts ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {PIPELINE_STEPS.map((step) => {
                const count = alerts.pipeline[step.key] ?? 0;
                return (
                  <div
                    key={step.key}
                    className="rounded-xl border border-border p-4"
                  >
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${step.color}`}
                    >
                      {step.label}
                    </span>
                    <p className="mt-3 font-display text-3xl font-extrabold">
                      {count}
                    </p>
                    <Link
                      to="/admin/orders"
                      search={{ status: step.key }}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pipeline data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Source */}
      {stats && Object.keys(stats.by_source).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Orders by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.by_source).map(([src, count]) => (
                <span
                  key={src}
                  className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold"
                >
                  {src}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {statsLoading && (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}