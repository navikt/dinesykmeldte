import { nextleton } from "nextleton";
import {
  Faro,
  LogLevel,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { browserEnv, isLocalOrDemo } from "../utils/env";

export const faro = nextleton("dinesykmeldte-faro", (): Faro | null => {
  if (typeof window === "undefined" || isLocalOrDemo) return null;

  return initializeFaro({
    url: browserEnv.faroUrl,
    app: {
      name: "dinesykmeldte",
      version: browserEnv.version,
    },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: false,
      }),
    ],
  });
});

export function pinoLevelToFaroLevel(pinoLevel: string): LogLevel {
  switch (pinoLevel) {
    case "trace":
      return LogLevel.TRACE;
    case "debug":
      return LogLevel.DEBUG;
    case "info":
      return LogLevel.INFO;
    case "warn":
      return LogLevel.WARN;
    case "error":
      return LogLevel.ERROR;
    default:
      throw new Error(`Unknown level: ${pinoLevel}`);
  }
}
