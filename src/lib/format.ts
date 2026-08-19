/** Formatting helpers shared across the app. */

export function inr(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return "₹" + num.toLocaleString("en-IN");
}

export function durationLabel(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `${hours} hrs`;
  }
  return `${minutes} mins`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
