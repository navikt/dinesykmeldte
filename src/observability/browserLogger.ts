import { captureMessage, isInitialized, type SeverityLevel } from "@nais/apm";
import type { LogEvent } from "pino";
import { scrubTelemetryString } from "./browser";

const MAX_MESSAGE_LENGTH = 4_000;

const severityByPinoLevel: Partial<Record<string, SeverityLevel>> = {
  trace: "debug",
  debug: "debug",
  info: "info",
  warn: "warning",
};

const serializeLogValue = (value: unknown): string => {
  if (typeof value === "string") return value;

  const seen = new WeakSet<object>();
  try {
    return (
      JSON.stringify(value, (_, item: unknown) => {
        if (item instanceof Error) {
          return {
            name: item.name,
            message: item.message,
            stack: item.stack,
          };
        }
        if (item !== null && typeof item === "object") {
          if (seen.has(item)) return "[circular]";
          seen.add(item);
        }
        return item;
      }) ?? String(value)
    );
  } catch {
    return String(value);
  }
};

export function forwardBrowserLogToApm(log: LogEvent): void {
  const severity = severityByPinoLevel[log.level.label];
  if (!severity || !isInitialized()) return;

  const message = scrubTelemetryString(
    log.messages.map(serializeLogValue).join(" "),
  ).slice(0, MAX_MESSAGE_LENGTH);
  if (message) captureMessage(message, severity);
}
