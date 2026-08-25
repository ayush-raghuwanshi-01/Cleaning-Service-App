import { RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import type { ApiErrorCode } from "@/lib/api";

interface ErrorStateProps {
  /** Short headline, e.g. "Couldn't load services". */
  title?: string;
  /** Optional supporting copy. Defaults to a message derived from the error. */
  description?: string;
  /** The caught error — used to pick the most helpful copy. */
  error?: unknown;
  /** Call this to re-run the failed request (usually `refetch`). */
  onRetry?: () => void;
  /** Retry handler is async (e.g. refetch returns a promise). */
  compact?: boolean;
  className?: string;
}

const SYSTEMIC_COPY: Record<string, { title: string; description: string }> = {
  offline: {
    title: "You're offline",
    description:
      "This content needs an internet connection. Reconnect and try again — your data is safe.",
  },
  network: {
    title: "Can't reach Home Shine",
    description:
      "We couldn't contact our servers. This is usually temporary — please retry in a few seconds.",
  },
  timeout: {
    title: "That took too long",
    description:
      "The server didn't respond in time. Please try again — if it keeps happening, call us and we'll help.",
  },
  server: {
    title: "Our server hit a snag",
    description:
      "Something went wrong on our side. We've logged it — please retry in a moment.",
  },
};

/**
 * Friendly, actionable error card for failed data loads. Shows a distinct
 * message for connectivity problems vs. other failures, and always offers a
 * retry when one is available.
 */
export function ErrorState({
  title,
  description,
  error,
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  const code: ApiErrorCode | undefined =
    error && typeof error === "object" && "code" in error
      ? ((error as { code?: ApiErrorCode }).code ?? undefined)
      : undefined;

  const systemic = code ? SYSTEMIC_COPY[code] : undefined;
  const headline = title ?? systemic?.title ?? "Something went wrong";
  const body =
    description ??
    systemic?.description ??
    (error instanceof Error && error.message
      ? error.message
      : "We couldn't load this. Please try again.");

  const showOfflineIcon = code === "offline" || code === "network";

  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card text-center",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      <span
        className={cn(
          "mx-auto grid place-items-center rounded-2xl",
          compact ? "h-11 w-11" : "h-14 w-14",
          showOfflineIcon
            ? "bg-highlight/10 text-highlight"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {showOfflineIcon ? (
          <WifiOff className={compact ? "h-5 w-5" : "h-7 w-7"} />
        ) : (
          <RefreshCcw className={compact ? "h-5 w-5" : "h-7 w-7"} />
        )}
      </span>
      <p className={cn("font-bold text-foreground", compact ? "mt-3 text-sm" : "mt-4 text-base")}>
        {headline}
      </p>
      <p
        className={cn(
          "mx-auto text-muted-foreground",
          compact ? "mt-1 text-xs" : "mt-1.5 max-w-sm text-sm",
        )}
      >
        {body}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size={compact ? "sm" : "md"}
          className="mt-4"
          onClick={() => {
            try {
              const result = onRetry() as unknown;
              if (result instanceof Promise) result.catch(() => undefined);
            } catch {
              // Retry handlers must never crash the error card itself.
            }
          }}
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
