import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { BRAND_NAME } from "@/lib/config";
import { createLogger } from "@/lib/logger";

const log = createLogger("error-boundary");

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  errorId: string;
}

/**
 * App-level error boundary. Catches render crashes and shows a branded,
 * friendly error screen instead of a white page. Failures are logged with a
 * short reference id users can quote to support; the raw message is tucked
 * behind a details toggle instead of being dumped on screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "", errorId: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
      errorId: Math.random().toString(36).slice(2, 8).toUpperCase(),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error("render crash", { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {BRAND_NAME} hit an unexpected error. Your bookings are safe — try
            reloading the page. If it keeps happening, call us and we'll help
            you book over the phone.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
            >
              Reload page
            </button>
            <a
              href="/"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary active:scale-95"
            >
              Go to home
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Error reference: <span className="font-mono font-semibold">{this.state.errorId}</span>
          </p>
          {this.state.message && (
            <details className="mt-2 text-left">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                Technical details
              </summary>
              <p className="mt-1 break-words rounded-lg bg-muted p-2 text-[11px] text-muted-foreground">
                {this.state.message}
              </p>
            </details>
          )}
        </div>
      </div>
    );
  }
}
