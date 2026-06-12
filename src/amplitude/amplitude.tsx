import {
  getCurrentConsent,
  logAnalyticsEvent,
} from "@navikt/nav-dekoratoren-moduler";
import { logger } from "@navikt/next-logger";
import { useEffect, useRef } from "react";
import { browserEnv } from "../utils/env";
import type { AmplitudeTaxonomyEvents } from "./taxonomyEvents";

export function useLogAmplitudeEvent<E extends AmplitudeTaxonomyEvents>(
  event: E,
  extraData?: SafeExtraData<E>,
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
  ["sykmeldt", "[id]"], // /sykmeldt/<sykmeldtId> overview page
  ["info", "oppfolging"],
  ["info", "sporsmal-og-svar"],
  // Known static single-segment routes from the side menu — must come before the
  // ["[id]"] catch-all so they are preserved rather than collapsed to /[id].
  ["sykmeldinger"],
  ["soknader"],
  ["meldinger"],
  ["[id]"],
];

/**
 * Sanitizes a URL so that dynamic ID segments (sykmeldtId, narmestelederId, etc.)
 * are replaced with [id]. Query parameters and hash are stripped.
 * Prevents leakage of person-related identifiers to Amplitude.
 *
 * Returns the full URL including origin with the sanitized path.
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

/**
 * Restricts extra properties at call-sites: keys that already exist in event.data
 * are disallowed (typed as never) to prevent accidental overrides of typed/sanitized fields.
 */
type SafeExtraData<E extends AmplitudeTaxonomyEvents> = E extends {
  data: infer D extends object;
}
  ? { readonly [K in keyof D]?: never } & Record<string, unknown>
  : Record<string, unknown>;

/**
 * Merges event.data and extraData into a single properties object.
 *
 * Keys from extraData that overlap with event.data are ignored (event.data wins) to prevent
 * call-sites from accidentally overriding typed/sanitized properties.
 * A warning is logged when overlap is detected so it surfaces during development.
 *
 * For "navigere" events, "destinasjon" is passed through sanitizeDestination as a final
 * safety net against PII leakage, regardless of how the event was constructed.
 */
export function buildEventProperties(
  event: AmplitudeTaxonomyEvents,
  extraData?: Record<string, unknown>,
): Record<string, unknown> {
  const eventData =
    "data" in event ? (event.data as Record<string, unknown>) : {};
  const safeExtra: Record<string, unknown> = {};

  if (extraData) {
    for (const [key, value] of Object.entries(extraData)) {
      if (key in eventData) {
        logger.warn(
          `Amplitude: extraData key "${key}" conflicts with event.data for "${event.eventName}" — event.data value is used`,
        );
      } else {
        safeExtra[key] = value;
      }
    }
  }

  const properties: Record<string, unknown> = { ...eventData, ...safeExtra };

  // Safety net: always sanitize "destinasjon" on "navigere" events to prevent PII leakage.
  if (event.eventName === "navigere") {
    const dest = properties.destinasjon;
    if (typeof dest === "string") {
      properties.destinasjon = sanitizeDestination(dest);
    }
  }

  return properties;
}

export async function logAmplitudeEvent<E extends AmplitudeTaxonomyEvents>(
  event: E,
  extraData?: SafeExtraData<E>,
): Promise<void> {
  if (browserEnv.amplitudeEnabled !== "true") {
    logDebugEvent(event, extraData);
    return;
  }

  try {
    const { consent } = getCurrentConsent();
    if (consent.analytics) {
      await logAnalyticsEvent({
        origin: sanitizeAmplitudeOrigin(
          window.location.toString(),
          browserEnv.publicPath,
        ),
        eventName: event.eventName,
        eventData: buildEventProperties(event, extraData),
      });
    }
  } catch (e) {
    logger.warn(new Error("Failed to log amplitude event", { cause: e }));
  }
}

/**
 * Sanitizes a URL or relative path so that dynamic ID segments are replaced with [id].
 * Query parameters and hash are stripped.
 *
 * Returns a sanitized path without the origin, even for absolute URLs.
 * Example: "https://www.nav.no/sykmeldt/abc/sykmeldinger" → "/sykmeldt/[id]/sykmeldinger"
 *
 * Used to sanitize "destinasjon" in analytics events to prevent sykmeldtId,
 * narmestelederId, and other dynamic segments from being sent to Amplitude.
 */
export function sanitizeDestination(
  url: string,
  publicPath: string | undefined = browserEnv.publicPath,
): string {
  // Extract pathname – handles both absolute URLs and relative paths
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    // Relative path – strip query and hash
    [pathname] = url.split(/[?#]/);
  }

  const normalizedPublicPath = normalizePath(publicPath);
  const routePath =
    normalizedPublicPath && pathname.startsWith(normalizedPublicPath)
      ? pathname.slice(normalizedPublicPath.length) || "/"
      : pathname;
  const sanitizedRoute = sanitizeRoutePath(routePath);

  return normalizedPublicPath && pathname.startsWith(normalizedPublicPath)
    ? `${normalizedPublicPath}${sanitizedRoute === "/" ? "" : sanitizedRoute}`
    : sanitizedRoute;
}

function logDebugEvent(
  event: AmplitudeTaxonomyEvents,
  extraData?: Record<string, unknown>,
): void {
  const data = buildEventProperties(event, extraData);

  logger.info(
    `Amplitude debug event: ${event.eventName} ${JSON.stringify(data)}`,
  );
}
