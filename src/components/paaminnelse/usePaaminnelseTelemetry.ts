import { useEffect, useRef } from "react";
import {
  type AidPaaminnelseDeliveryEvent,
  recordAidPaaminnelse,
} from "../../observability/aidTelemetry";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import type { PaaminnelseAvailability } from "./paaminnelseAvailability";

type DeliveryAttributes = Omit<AidPaaminnelseDeliveryEvent, "hendelse">;

type Params = {
  narmestelederId: string;
  orgnummer: string;
  gruppe: Tildelingsgruppe;
  availability: PaaminnelseAvailability;
};

const hiddenOutcomes = {
  missing_assignment: "vurdering_mangler",
  status_error: "status_feilet",
  not_available: "skjult",
} as const;

function deliveryAttributes(
  availability: PaaminnelseAvailability,
  gruppe: Tildelingsgruppe,
): DeliveryAttributes | null {
  if (availability.kind === "pending") return null;

  if (availability.kind === "visible") {
    return {
      gruppe,
      variant: "aid",
      paaminnelsevalg:
        availability.status === "BESTILT" ? "bestilt" : "ikke_bestilt",
      utfall: "tilgjengelig",
    };
  }

  const isOutsideTreatment =
    gruppe === "kontroll" || gruppe === "utenfor_scope";
  return {
    gruppe,
    variant: "skjult",
    paaminnelsevalg: isOutsideTreatment ? "ikke_tilbudt" : "ukjent",
    utfall: hiddenOutcomes[availability.reason],
  };
}

/** First settled decision and first viewport entry per mounted context. */
export function usePaaminnelseTelemetry({
  narmestelederId,
  orgnummer,
  gruppe,
  availability,
}: Params) {
  const elementRef = useRef<HTMLElement>(null);
  // IDs distinguish visits only in memory; never pass them to the emitter.
  const visit = useRef({
    narmestelederId,
    orgnummer,
    decisionRecorded: false,
    viewRecorded: false,
  });
  const decision = deliveryAttributes(availability, gruppe);
  const variant = decision?.variant;
  const paaminnelsevalg = decision?.paaminnelsevalg;
  const utfall = decision?.utfall;

  useEffect(() => {
    if (
      visit.current.narmestelederId !== narmestelederId ||
      visit.current.orgnummer !== orgnummer
    ) {
      visit.current = {
        narmestelederId,
        orgnummer,
        decisionRecorded: false,
        viewRecorded: false,
      };
    }
    if (!variant || !paaminnelsevalg || !utfall) return;
    const currentVisit = visit.current;
    const attributes = { gruppe, variant, paaminnelsevalg, utfall };
    if (!currentVisit.decisionRecorded) {
      currentVisit.decisionRecorded = true;
      recordAidPaaminnelse({ ...attributes, hendelse: "beslutning" });
    }
    if (
      variant !== "aid" ||
      currentVisit.viewRecorded ||
      !elementRef.current ||
      typeof IntersectionObserver === "undefined"
    )
      return;

    // disconnect() does not invalidate callbacks already queued by the browser.
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (
        !active ||
        currentVisit.viewRecorded ||
        !entries.some((entry) => entry.isIntersecting)
      )
        return;
      currentVisit.viewRecorded = true;
      recordAidPaaminnelse({ ...attributes, hendelse: "vist" });
      observer.disconnect();
    });
    observer.observe(elementRef.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [narmestelederId, orgnummer, gruppe, variant, paaminnelsevalg, utfall]);

  return elementRef;
}
