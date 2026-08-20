import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold">SparkleHome</span>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" search={{ service: undefined, book: undefined }} className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

