import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchDayStats, fetchRevenueSummary } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle, ErrorState, Skeleton } from "@/components/ui";
import { formatDate, inr, todayISO } from "@/lib/format";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

/** Widest report window we'll query in one go — keeps payloads sane. */
const MAX_RANGE_DAYS = 365;

function AdminAnalytics() {
  const today = todayISO();
  const weekAgo = getPastDate(7);

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);

  const rangeInvalid =
    !startDate || !endDate || startDate > endDate || daysBetween(startDate, endDate) > MAX_RANGE_DAYS;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchDayStats(),
  });

  const { data: revenueData, isLoading: revenueLoading, error: revenueError, refetch } = useQuery({
    queryKey: ["revenue-summary", startDate, endDate],
    queryFn: () => fetchRevenueSummary(startDate, endDate),
    enabled: Boolean(startDate && endDate) && !rangeInvalid,
    meta: { silent: true },
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
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="font-display text-2xl font-extrabold">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue trends */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Revenue trend</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Start date"
                value={startDate}
                max={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                aria-label="End date"
                value={endDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              />
            </div>
          </div>
          {rangeInvalid && (
            <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
              Pick a valid range — start before end, at most {MAX_RANGE_DAYS} days, up to today.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : rangeInvalid ? (
            <p className="text-sm text-muted-foreground">
              Fix the date range above to load revenue data.
            </p>
          ) : revenueError ? (
            <ErrorState
              compact
              title="Couldn't load revenue data"
              error={revenueError}
              onRetry={() => refetch()}
            />
          ) : revenueData ? (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Total revenue
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                    {inr(revenueData.total_revenue)}
                  </p>
                </div>
                <div className="rounded-xl bg-accent/5 p-4">
                  <p className="text-xs text-muted-foreground">
                    Total orders
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
                  Daily revenue ({formatDate(startDate)} – {formatDate(endDate)})
                </p>
                {revenueData.daily_revenue.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No orders in this window — try a wider date range.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {revenueData.daily_revenue.map((day) => {
                      const maxRevenue = Math.max(
                        ...revenueData.daily_revenue.map((d) => d.revenue),
                        1,
                      );
                      const pct = Math.max((day.revenue / maxRevenue) * 100, 4);
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 text-xs text-muted-foreground">
                            {formatDate(day.date)}
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
                            ({day.orders} order{day.orders === 1 ? "" : "s"})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Revenue by source */}
              <div>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">
                  By source
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(revenueData.by_source).map(
                    ([src, count]) => (
                      <span
                        key={src}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize"
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
                  By status
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(revenueData.by_status).map(
                    ([status, count]) => (
                      <span
                        key={status}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize"
                      >
                        {status.replace(/_/g, " ")}: {count}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function getPastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}