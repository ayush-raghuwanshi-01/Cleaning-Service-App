import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin", className)} />;
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}
