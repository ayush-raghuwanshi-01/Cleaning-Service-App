/**
 * Tiny leveled logger for the browser app.
 *
 * Why: scattered `console.*` calls are impossible to filter or ship anywhere.
 * This gives us one place that (a) prefixes and groups entries, (b) keeps
 * noisy debug output out of production, and (c) is the single hook point for
 * wiring a real transport (Sentry, HTTP log collector, …) later — swap the
 * `write` implementation and every call site is covered.
 *
 * Usage:
 *   logger.debug("booking step", { step });
 *   logger.error("place booking failed", err);
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: Level = import.meta.env.DEV ? "debug" : "warn";

let logSequence = 0;

function write(level: Level, scope: string, message: string, detail?: unknown) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;

  logSequence += 1;
  const entry = {
    seq: logSequence,
    time: new Date().toISOString(),
    level,
    scope,
    message,
    detail: detail instanceof Error ? serializeError(detail) : detail,
  };

  // Console with a stable prefix so support/ops can grep for it.
  const prefix = `[${entry.scope}]`;
  const args: unknown[] = [prefix, entry.message];
  if (entry.detail !== undefined) args.push(entry.detail);

  switch (level) {
    case "debug":
      console.debug(...args);
      break;
    case "info":
      console.info(...args);
      break;
    case "warn":
      console.warn(...args);
      break;
    case "error":
      console.error(...args);
      break;
  }

  // Future transport hookup point (Sentry breadcrumbs, /api/log, …):
  // transport(entry);
}

function serializeError(error: Error): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };
  // Keep a short stack — full stacks are huge and rarely useful client-side.
  if (error.stack) out.stack = error.stack.split("\n").slice(0, 4).join(" | ");
  const anyError = error as Error & { status?: unknown; code?: unknown };
  if (anyError.status !== undefined) out.status = anyError.status;
  if (anyError.code !== undefined) out.code = anyError.code;
  return out;
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, detail?: unknown) => write("debug", scope, message, detail),
    info: (message: string, detail?: unknown) => write("info", scope, message, detail),
    warn: (message: string, detail?: unknown) => write("warn", scope, message, detail),
    error: (message: string, detail?: unknown) => write("error", scope, message, detail),
  };
}

export const logger = createLogger("app");
