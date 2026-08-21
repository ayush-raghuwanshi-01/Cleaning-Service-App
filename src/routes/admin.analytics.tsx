import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDayStats, fetchRevenueSummary } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { inr } from "@/lib/format";
import { todayISO } from "@/lib/format";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const today = todayISO();
  const weekAgo = getPastDate(7);

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchDayStats(),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue-summary", startDate, endDate],
    queryFn: () => fetchRevenueSummary(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });

  const items = [
    { label: "Orders today", value: stats ? String(stats.orders) : "—" },
    {
      label: "Completed today",
      value: stats ? String(stats.completed_orders) : "—",
    },
    { label: "Revenue today", value: stats ? inr(stats.revenue) : "—" },
    { label: "Cash today", value: stats ? inr(stats.revenue_cash) : "—" },
    { label: "UPI today", value: stats ? inr(stats.revenue_upi) : "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Revenue trends and order statistics
      </p>

      {/* Today's stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-extrabold">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue trends */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Revenue Trend</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : revenueData ? (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                    {inr(revenueData.total_revenue)}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Total Orders
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-accent">
                    {revenueData.total_orders}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="mt-1 font-display text-2xl font-extrabold">
                    {revenueData.completed_orders}
                  </p>
                </div>
              </div>

              {/* Simple bar chart representation */}
              <div>
                <p className="mb-3 text-sm font-semibold text-muted-foreground">
                  Daily Revenue (bars proportional)
                </p>
                <div className="space-y-2">
                  {revenueData.daily_revenue.map((day) => {
                    const maxRevenue = Math.max(
                      ...revenueData.daily_revenue.map(
                        (d) => d.revenue,
                      ),
                      1,
                    );
                    const pct = Math.max(
                      (day.revenue / maxRevenue) * 100,
                      4,
                    );
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">
                          {day.date}
                        </span>
                        <div className="flex flex-1 items-center gap-1">
                          <div
                            className="h-6 rounded bg-primary/30 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                          <span className="text-xs font-semibold">
                            {inr(day.revenue)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({day.orders} orders)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue by source */}
              <div>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">
                  By Source
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(revenueData.by_source).map(
                    ([src, count]) => (
                      <span
                        key={src}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
                      >
                        {src}: {count}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Revenue by status */}
              <div>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">
                  By Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(revenueData.by_status).map(
                    ([status, count]) => (
                      <span
                        key={status}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
                      >
                        {status}: {count}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a date range to see revenue data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getPastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}