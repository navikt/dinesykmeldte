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

type RouteSegment = string | "[id]";

const ROUTE_PATTERNS: RouteSegment[][] = [
  ["sykmeldt", "[id]", "sykmeldinger"],
  ["sykmeldt", "[id]", "soknader"],
  ["sykmeldt", "[id]", "meldinger"],
  ["sykmeldt", "[id]", "sykmelding", "[id]"],
  ["sykmeldt", "[id]", "soknad", "[id]"],
  ["sykmeldt", "[id]", "melding", "[id]"],
  ["info", "oppfolging"],
  ["info", "sporsmal-og-svar"],
  ["[id]"],
];

/**
 * Saniterer en URL slik at dynamiske id-segmenter (sykmeldtId, narmestelederId osv.)
 * erstattes med [id]. Query-parametere og hash fjernes.
 * Forhindrer lekkasje av person-relaterte identifikatorer til Amplitude.
 */
export function sanitizeAmplitudeOrigin(
  url: string,
  publicPath: string | undefined = browserEnv.publicPath,
): string {
  try {
    const parsed = new URL(url);
    const normalizedPublicPath = normalizePath(publicPath);
    const pathname = parsed.pathname;
    const routePath =
      normalizedPublicPath && pathname.startsWith(normalizedPublicPath)
        ? pathname.slice(normalizedPublicPath.length) || "/"
        : pathname;
    const sanitizedRoutePath = sanitizeRoutePath(routePath);
    const sanitizedPath =
      normalizedPublicPath && pathname.startsWith(normalizedPublicPath)
        ? `${normalizedPublicPath}${sanitizedRoutePath === "/" ? "" : sanitizedRoutePath}`
        : sanitizedRoutePath;

    return `${parsed.origin}${sanitizedPath}`;
  } catch {
    return "[invalid-url]";
  }
}

function normalizePath(path: string | undefined): string {
  if (!path || path === "/") {
    return "";
  }

  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function sanitizeRoutePath(path: string): string {
  if (path === "/") {
    return "/";
  }

  const segments = path.split("/").filter(Boolean);
  const matchingPattern = ROUTE_PATTERNS.find(
    (pattern) =>
      pattern.length === segments.length && patternMatches(pattern, segments),
  );

  if (!matchingPattern) {
    return `/${segments.map(() => "[id]").join("/")}`;
  }

  return `/${matchingPattern
    .map((patternSegment, index) =>
      patternSegment === "[id]" ? "[id]" : segments[index],
    )
    .join("/")}`;
}

function patternMatches(pattern: RouteSegment[], segments: string[]): boolean {
  return pattern.every(
    (patternSegment, index) =>
      patternSegment === "[id]" || patternSegment === segments[index],
  );
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
        origin: sanitizeAmplitudeOrigin(
          window.location.toString(),
          browserEnv.publicPath,
        ),
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
