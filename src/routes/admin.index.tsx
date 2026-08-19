import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDayStats } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchDayStats(),
  });

  const items = [
    { label: "Orders today", value: stats ? String(stats.orders) : "—" },
    { label: "Completed", value: stats ? String(stats.completed_orders) : "—" },
    { label: "Revenue", value: stats ? inr(stats.revenue) : "—" },
    { label: "Cash", value: stats ? inr(stats.revenue_cash) : "—" },
    { label: "UPI", value: stats ? inr(stats.revenue_upi) : "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {stats ? new Date(stats.date).toDateString() : "Today's overview"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader><CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="font-display text-2xl font-extrabold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {stats && Object.keys(stats.by_source).length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>By source</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(stats.by_source).map(([src, count]) => (
                <span key={src} className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                  {src}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
}
