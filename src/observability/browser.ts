import type {
  EventEvent,
  ExceptionEvent,
  MeasurementEvent,
} from "@grafana/faro-react";
import type { InitOptions } from "@nais/apm";
import { initNaisAPMClient } from "@nais/apm/react";
import { isLocalOrDemo } from "../utils/env";

export const BROWSER_APM_APP = "dinesykmeldte";
export const BROWSER_APM_NAMESPACE = "team-esyfo";
export const BROWSER_SESSION_SAMPLING_RATE = 1;
export const UNKNOWN_PAGE_ID = "/arbeidsgiver/sykmeldte/{unknown}";

const BASE_PATH = "/arbeidsgiver/sykmeldte";
const SAFE_NEXT_ASSET_PREFIXES = [
  "/_next/static/",
  `${BASE_PATH}/_next/static/`,
  "/team-esyfo/dinesykmeldte/_next/static/",
];
const AUTO_NAVIGATION_EVENTS = new Set([
  "faro.navigation",
  "faro.performance.navigation",
  "faro.performance.resource",
  "route_change",
]);
const SENSITIVE_WEB_VITAL_FIELDS = [
  "element",
  "interaction_target",
  "largest_shift_target",
  "longest_script_invoker",
  "longest_script_source_char_position",
  "longest_script_source_function_name",
  "longest_script_source_url",
  "resource_url",
] as const;

const routes: Array<[RegExp, string]> = [
  [/^\/?$/, BASE_PATH],
  [/^\/info\/oppfolging\/?$/, `${BASE_PATH}/info/oppfolging`],
  [/^\/info\/sporsmal-og-svar\/?$/, `${BASE_PATH}/info/sporsmal-og-svar`],
  [/^\/[^/]+\/?$/, `${BASE_PATH}/sykmeldt/{sykmeldtId}`],
  [/^\/sykmeldt\/[^/]+\/?$/, `${BASE_PATH}/sykmeldt/{sykmeldtId}`],
  [
    /^\/sykmeldt\/[^/]+\/meldinger\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/meldinger`,
  ],
  [
    /^\/sykmeldt\/[^/]+\/melding\/[^/]+\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/melding/{meldingId}`,
  ],
  [
    /^\/sykmeldt\/[^/]+\/soknader\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/soknader`,
  ],
  [
    /^\/sykmeldt\/[^/]+\/soknad\/[^/]+\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/soknad/{soknadId}`,
  ],
  [
    /^\/sykmeldt\/[^/]+\/sykmeldinger\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/sykmeldinger`,
  ],
  [
    /^\/sykmeldt\/[^/]+\/sykmelding\/[^/]+\/?$/,
    `${BASE_PATH}/sykmeldt/{sykmeldtId}/sykmelding/{sykmeldingId}`,
  ],
];

const pathWithoutBase = (pathname: string): string => {
  if (pathname === BASE_PATH) return "/";
  return pathname.startsWith(`${BASE_PATH}/`)
    ? pathname.slice(BASE_PATH.length)
    : pathname;
};

export function normalizeBrowserPath(value: string): string {
  const pathname = value.split(/[?#]/, 1)[0] || "/";
  const relativePath = pathWithoutBase(pathname);
  return (
    routes.find(([pattern]) => pattern.test(relativePath))?.[1] ??
    UNKNOWN_PAGE_ID
  );
}

export function canonicalizeBrowserPageUrl(value: string): string {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      (url.hostname !== "nav.no" && !url.hostname.endsWith(".nav.no"))
    ) {
      return UNKNOWN_PAGE_ID;
    }
    return `${url.origin}${normalizeBrowserPath(url.pathname)}`;
  } catch {
    return UNKNOWN_PAGE_ID;
  }
}

const canonicalizeBrowserRouteReference = (value: string): string => {
  try {
    new URL(value);
    return canonicalizeBrowserPageUrl(value);
  } catch {
    return normalizeBrowserPath(value);
  }
};

const isSafeNextAssetPath = (pathname: string): boolean =>
  SAFE_NEXT_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const canonicalizeStackFrameUrl = (value: string): string => {
  const relativePath = value.split(/[?#]/, 1)[0] ?? value;
  if (isSafeNextAssetPath(relativePath)) return relativePath;

  try {
    const url = new URL(value);
    const isNavHost =
      url.hostname === "nav.no" || url.hostname.endsWith(".nav.no");
    if (isNavHost && isSafeNextAssetPath(url.pathname)) {
      return `${url.origin}${url.pathname}`;
    }
  } catch {
    // Fall through to the route allowlist.
  }

  return canonicalizeBrowserRouteReference(value);
};

const sanitizeEventPayload = (payload: EventEvent): EventEvent | null => {
  // CSP reports can contain source snippets, complete policies and arbitrary
  // blocked/referrer URLs. They are outside this baseline's signal contract.
  if (payload.name === "securitypolicyviolation") return null;
  if (!AUTO_NAVIGATION_EVENTS.has(payload.name) || !payload.attributes) {
    return payload;
  }

  const attributes = { ...payload.attributes };
  for (const field of [
    "fromRoute",
    "fromUrl",
    "name",
    "route",
    "toRoute",
    "toUrl",
    "url",
  ] as const) {
    if (typeof attributes[field] === "string") {
      attributes[field] = canonicalizeBrowserRouteReference(attributes[field]);
    }
  }
  return { ...payload, attributes };
};

const sanitizeExceptionPayload = (payload: ExceptionEvent): ExceptionEvent => {
  const frames = payload.stacktrace?.frames;
  if (!frames) return payload;

  return {
    ...payload,
    stacktrace: {
      ...payload.stacktrace,
      frames: frames.map((frame) => ({
        ...frame,
        filename: canonicalizeStackFrameUrl(frame.filename),
      })),
    },
  };
};

const sanitizeMeasurementPayload = (
  payload: MeasurementEvent,
): MeasurementEvent => {
  if (payload.type !== "web-vitals" || !payload.context) return payload;

  const context = { ...payload.context };
  for (const field of SENSITIVE_WEB_VITAL_FIELDS) delete context[field];
  return { ...payload, context };
};

type BeforeSend = NonNullable<InitOptions["beforeSend"]>;

/**
 * Page URLs are a special case: the SDK's mandatory PII scrubber removes
 * PII-shaped values, but it cannot know which path segments are domain IDs.
 */
export const sanitizeBrowserTelemetry: BeforeSend = (item) => {
  const meta = { ...item.meta };
  delete meta.user;

  if (meta.page) {
    meta.page = {
      ...meta.page,
      ...(typeof meta.page.id === "string"
        ? { id: normalizeBrowserPath(meta.page.id) }
        : {}),
      ...(typeof meta.page.url === "string"
        ? { url: canonicalizeBrowserPageUrl(meta.page.url) }
        : {}),
    };
  }

  let payload = item.payload;
  if (item.type === "event") {
    const sanitized = sanitizeEventPayload(payload as EventEvent);
    if (!sanitized) return null;
    payload = sanitized;
  } else if (item.type === "exception") {
    payload = sanitizeExceptionPayload(payload as ExceptionEvent);
  } else if (item.type === "measurement") {
    payload = sanitizeMeasurementPayload(payload as MeasurementEvent);
  }

  return { ...item, payload, meta };
};

export const browserApmOptions = {
  app: BROWSER_APM_APP,
  namespace: BROWSER_APM_NAMESPACE,
  beforeSend: sanitizeBrowserTelemetry,
  dangerouslyDisablePiiScrubbing: false,
  faro: {
    trackResources: false,
    webVitalsInstrumentation: {
      reportAllChanges: false,
      trackAttributionSources: false,
    },
    pageTracking: {
      generatePageId: (location) => normalizeBrowserPath(location.pathname),
    },
    sessionTracking: {
      samplingRate: BROWSER_SESSION_SAMPLING_RATE,
    },
  },
  tracing: false,
  sessionReplay: { enabled: false },
  screenshotOnError: false,
} satisfies InitOptions;

export function initBrowserObservability() {
  if (isLocalOrDemo) return undefined;
  return initNaisAPMClient(browserApmOptions);
}
