import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types";

/** One source of truth for status colours across customer + admin views. */
const STATUS_CLASSES: Record<OrderStatus, string> = {
  requested: "bg-amber-100 text-amber-800",
  contacted: "bg-sky-100 text-sky-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-violet-100 text-violet-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export function statusClasses(status: string): string {
  return STATUS_CLASSES[status as OrderStatus] ?? "bg-secondary text-foreground";
}

export function statusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status as OrderStatus] ?? status;
}
