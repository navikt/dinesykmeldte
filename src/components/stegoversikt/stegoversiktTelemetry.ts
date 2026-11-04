import { useEffect, useRef } from "react";
import {
  type AidStegoversiktEvent,
  recordAidStegoversikt,
  type STEGOVERSIKT_FANER,
  type STEGOVERSIKT_LENKER,
} from "../../observability/aidTelemetry";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";

export { STEGOVERSIKT_FANER } from "../../observability/aidTelemetry";

export type StegoversiktFane = (typeof STEGOVERSIKT_FANER)[number];
export type StegoversiktLenke = (typeof STEGOVERSIKT_LENKER)[number];

function context(gruppe: Tildelingsgruppe) {
  return {
    schema_version: "1" as const,
    flate: "stegoversikt" as const,
    tiltakspakke: "2" as const,
    gruppe,
  };
}

export function recordStegoversiktTabSelected(
  gruppe: Tildelingsgruppe,
  fane: StegoversiktFane,
): void {
  recordAidStegoversikt({
    ...context(gruppe),
    hendelse: "fane_valgt",
    fane,
  });
}

export function recordStegoversiktToggle(
  gruppe: Tildelingsgruppe,
  open: boolean,
): void {
  recordAidStegoversikt({
    ...context(gruppe),
    hendelse: open ? "vis" : "skjul",
  });
}

export function recordStegoversiktLinkClick(
  gruppe: Tildelingsgruppe,
  lenke: StegoversiktLenke,
  fane?: StegoversiktFane,
): void {
  recordAidStegoversikt({
    ...context(gruppe),
    hendelse: "lenke_klikket",
    lenke,
    ...(fane ? { fane } : {}),
  });
}

export function useStegoversiktTelemetry(gruppe: Tildelingsgruppe) {
  const elementRef = useRef<HTMLElement>(null);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (
      viewRecorded.current ||
      !elementRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (
        !active ||
        viewRecorded.current ||
        !entries.some((entry) => entry.isIntersecting)
      ) {
        return;
      }

      viewRecorded.current = true;
      const event: Extract<
        AidStegoversiktEvent,
        { hendelse: "vist" | "vis" | "skjul" }
      > = {
        ...context(gruppe),
        hendelse: "vist",
      };
      recordAidStegoversikt(event);
      observer.disconnect();
    });

    observer.observe(elementRef.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [gruppe]);

  return elementRef;
}
