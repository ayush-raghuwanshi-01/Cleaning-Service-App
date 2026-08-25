import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** How long the toast stays visible (ms). Errors stay longer by default. */
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; classes: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: "border-l-accent text-accent",
  },
  error: {
    icon: XCircle,
    classes: "border-l-destructive text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-l-highlight text-highlight",
  },
  info: {
    icon: Info,
    classes: "border-l-primary text-primary",
  },
};

const AUTO_DISMISS_MS = 4500;
/** Errors need more reading time — and never vanish mid-read. */
const ERROR_DISMISS_MS = 7000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { ...t, id }]);
      const duration =
        t.duration ?? (t.variant === "error" ? ERROR_DISMISS_MS : AUTO_DISMISS_MS);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  // Global failure notifications (query/mutation caches in main.tsx) arrive as
  // DOM events so caches don't need a React context reference.
  useEffect(() => {
    const onAppError = (e: Event) => {
      const detail = (e as CustomEvent<{ title?: string; description?: string }>).detail;
      toast({
        variant: "error",
        title: detail?.title ?? "Something went wrong",
        description: detail?.description,
      });
    };
    window.addEventListener("app:error", onAppError);
    return () => window.removeEventListener("app:error", onAppError);
  }, [toast]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ variant: "success", title, description }),
      error: (title, description) => toast({ variant: "error", title, description }),
      warning: (title, description) => toast({ variant: "warning", title, description }),
      info: (title, description) => toast({ variant: "info", title, description }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport: bottom-center on mobile, bottom-right on desktop */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((t) => {
          const { icon: Icon, classes } = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border border-l-4 bg-card p-4 shadow-lift animate-fade-up",
                classes,
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context+hook pair
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
