import { Badge } from "./Badge";
import { cn } from "@/lib/utils";
import { statusClasses, statusLabel } from "@/lib/status";

/** Coloured pill for an order status, consistent everywhere it appears. */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge className={cn(statusClasses(status), className)}>
      {statusLabel(status)}
    </Badge>
  );
}
