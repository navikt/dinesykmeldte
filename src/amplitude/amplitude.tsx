import {
  logAmplitudeEvent as dekoratorenLogAmplitudeEvent,
  getCurrentConsent,
} from "@navikt/nav-dekoratoren-moduler";
import { logger } from "@navikt/next-logger";
import { useEffect, useRef } from "react";
import { browserEnv } from "../utils/env";
import type { AmplitudeTaxonomyEvents } from "./taxonomyEvents";

export function useLogAmplitudeEvent(
  event: AmplitudeTaxonomyEvents,
  extraData?: Record<string, unknown>,
  condition: () => boolean = () => true,
): void {
  const stableEvent = useRef(event);
  const stableExtraData = useRef(extraData);
  const stableCondition = useRef(condition);

  useEffect(() => {
    if (stableCondition.current()) {
      logAmplitudeEvent(stableEvent.current, stableExtraData.current);
    }
  }, []);
}

/**
 * Kjente statiske stisegmenter i applikasjonen.
 * Alle andre segmenter regnes som dynamiske identifikatorer (sykmeldtId, sykmeldingId, osv.)
 * og erstattes med [id] før origin sendes til Amplitude.
 */
const STATIC_PATH_SEGMENTS = new Set([
  "sykmeldt",
  "sykmeldinger",
  "soknader",
  "meldinger",
  "sykmelding",
  "soknad",
  "melding",
  "info",
  "oppfolging",
  "sporsmal-og-svar",
]);

/**
 * Saniterer en URL slik at dynamiske id-segmenter (sykmeldtId, narmestelederId osv.)
 * erstattes med [id]. Query-parametere og hash fjernes.
 * Forhindrer lekkasje av person-relaterte identifikatorer til Amplitude.
 */
export function sanitizeAmplitudeOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    const sanitizedPath = parsed.pathname
      .split("/")
      .map((segment) => {
        if (segment === "" || STATIC_PATH_SEGMENTS.has(segment)) {
          return segment;
        }
        return "[id]";
      })
      .join("/");
    return `${parsed.origin}${sanitizedPath}`;
  } catch {
    return "[invalid-url]";
  }
}

export async function logAmplitudeEvent(
  event: AmplitudeTaxonomyEvents,
  extraData?: Record<string, unknown>,
): Promise<void> {
  if (browserEnv.amplitudeEnabled !== "true") {
    logDebugEvent(event, extraData);
    return;
  }

  try {
    const { consent } = getCurrentConsent();
    if (consent.analytics) {
      const baseEvent = taxonomyToAmplitudeEvent(event, extraData);
      await dekoratorenLogAmplitudeEvent({
        origin: sanitizeAmplitudeOrigin(window.location.toString()),
        eventName: baseEvent.event_type,
        eventData: baseEvent.event_properties,
      });
    }
  } catch (e) {
    logger.warn(new Error("Failed to log amplitude event", { cause: e }));
  }
}

function taxonomyToAmplitudeEvent(
  event: AmplitudeTaxonomyEvents,
  extraData: Record<string, unknown> | undefined,
): {
  event_type: string;
  event_properties: Record<string, unknown>;
} {
  const properties = { ...("data" in event ? event.data : {}), ...extraData };

  return {
    event_type: event.eventName,
    event_properties: properties,
  };
}

function logDebugEvent(
  event: AmplitudeTaxonomyEvents,
  extraData?: Record<string, unknown>,
): void {
  const data = { ...("data" in event ? event.data : {}), ...extraData };

  logger.info(
    `Amplitude debug event: ${event.eventName} ${JSON.stringify(data)}`,
  );
}
