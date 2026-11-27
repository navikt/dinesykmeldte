import { useEffect, useRef } from "react";
import {
  recordAidStegoversikt,
  type STEGOVERSIKT_FANER,
  type STEGOVERSIKT_LENKER,
} from "../../observability/aidTelemetry";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  type Tildelingsgruppe,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { useTiltakspakke } from "../../services/tiltakspakke/useTiltakspakke";

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

function useGruppe() {
  return useTiltakspakke(DIALOGMOTE_TILTAKSPAKKE_2).gruppe;
}

export function useStegoversiktTelemetry() {
  const gruppe = useGruppe();

  return {
    recordTabSelected(fane: StegoversiktFane): void {
      recordAidStegoversikt({
        ...context(gruppe),
        hendelse: "fane_valgt",
        fane,
      });
    },
    recordToggle(open: boolean): void {
      recordAidStegoversikt({
        ...context(gruppe),
        hendelse: open ? "vis" : "skjul",
      });
    },
    recordLinkClick(lenke: StegoversiktLenke, fane?: StegoversiktFane): void {
      recordAidStegoversikt({
        ...context(gruppe),
        hendelse: "lenke_klikket",
        lenke,
        ...(fane ? { fane } : {}),
      });
    },
  };
}

export function useStegoversiktViewTelemetry() {
  const gruppe = useGruppe();
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
      recordAidStegoversikt({
        ...context(gruppe),
        hendelse: "vist",
      });
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
