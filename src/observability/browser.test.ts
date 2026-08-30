import { describe, expect, it } from "vitest";
import {
  BROWSER_APM_APP,
  BROWSER_APM_NAMESPACE,
  BROWSER_SESSION_SAMPLING_RATE,
  browserApmOptions,
  canonicalizeBrowserPageUrl,
  normalizeBrowserPath,
  sanitizeBrowserTelemetry,
  UNKNOWN_PAGE_ID,
} from "./browser";

const sykmeldtId = "11111111-1111-4111-8111-111111111111";
const meldingId = "22222222-2222-4222-8222-222222222222";

describe("browser observability contract", () => {
  it.each([
    ["/arbeidsgiver/sykmeldte", "/arbeidsgiver/sykmeldte"],
    [
      "/arbeidsgiver/sykmeldte?bedrift=975289753#oversikt",
      "/arbeidsgiver/sykmeldte",
    ],
    [
      `/arbeidsgiver/sykmeldte/${sykmeldtId}`,
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}",
    ],
    [
      `/sykmeldt/${sykmeldtId}/melding/${meldingId}`,
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/melding/{meldingId}",
    ],
    [
      `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/soknad/${meldingId}?token=hemmelig`,
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/soknad/{soknadId}",
    ],
    [
      `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/sykmelding/${meldingId}`,
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmelding/{sykmeldingId}",
    ],
    ["/arbeidsgiver/sykmeldte/ukjent/sti", UNKNOWN_PAGE_ID],
  ])("normaliserer %s", (input, expected) => {
    expect(normalizeBrowserPath(input)).toBe(expected);
  });

  it("beholder bare origin og normalisert rute i page URL", () => {
    expect(
      canonicalizeBrowserPageUrl(
        `https://leder:hemmelig@www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/melding/${meldingId}?bedrift=975289753#detaljer`,
      ),
    ).toBe(
      "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/melding/{meldingId}",
    );
    expect(canonicalizeBrowserPageUrl("data:text/plain,hemmelig")).toBe(
      UNKNOWN_PAGE_ID,
    );
    expect(canonicalizeBrowserPageUrl("ikke en url med 01010112345")).toBe(
      UNKNOWN_PAGE_ID,
    );
  });

  it("fjerner user-meta og kanoniserer page-meta uten å mutere input", () => {
    const raw = {
      type: "event",
      payload: { name: "route_change", attributes: {} },
      meta: {
        user: { id: "leder@nav.no" },
        page: {
          id: `/sykmeldt/${sykmeldtId}/melding/${meldingId}`,
          url: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/melding/${meldingId}?token=hemmelig`,
        },
      },
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    const sanitized = sanitizeBrowserTelemetry(raw);

    expect(sanitized?.meta.user).toBeUndefined();
    expect(sanitized?.meta.page).toEqual({
      id: "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/melding/{meldingId}",
      url: "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/melding/{meldingId}",
    });
    expect(raw.meta.page?.url).toContain(sykmeldtId);
  });

  it("kanoniserer URL-feltene fra Faros automatiske navigasjon", () => {
    const raw = {
      type: "event",
      payload: {
        name: "faro.navigation",
        timestamp: "2026-08-30T18:00:00.000Z",
        attributes: {
          fromUrl: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}?bedrift=975289753`,
          toUrl: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/soknad/${meldingId}?token=hemmelig`,
        },
      },
      meta: {},
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    const sanitized = sanitizeBrowserTelemetry(raw);

    expect(sanitized?.payload).toEqual(
      expect.objectContaining({
        attributes: {
          fromUrl:
            "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}",
          toUrl:
            "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/soknad/{soknadId}",
        },
      }),
    );
  });

  it("normaliserer rå pathnames fra APM-rutesporingen før transport", () => {
    const raw = {
      type: "event",
      payload: {
        name: "route_change",
        timestamp: "2026-08-30T18:00:00.000Z",
        attributes: {
          fromUrl: `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/sykmeldinger`,
          toRoute: `/arbeidsgiver/sykmeldte/sykmeldt/${meldingId}/sykmeldinger`,
          toUrl: `/arbeidsgiver/sykmeldte/sykmeldt/${meldingId}/sykmeldinger`,
        },
      },
      meta: {},
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    expect(sanitizeBrowserTelemetry(raw)?.payload).toEqual(
      expect.objectContaining({
        attributes: {
          fromUrl: "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmeldinger",
          toRoute: "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmeldinger",
          toUrl: "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmeldinger",
        },
      }),
    );
  });

  it("dropper CSP-rapporter som ligger utenfor baseline-kontrakten", () => {
    const raw = {
      type: "event",
      payload: {
        name: "securitypolicyviolation",
        timestamp: "2026-08-30T18:00:00.000Z",
        attributes: {
          documentURI: `https://www.nav.no/arbeidsgiver/sykmeldte/${sykmeldtId}?bedrift=975289753`,
          sample: "potensielt sensitivt innhold",
        },
      },
      meta: {},
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    expect(sanitizeBrowserTelemetry(raw)).toBeNull();
  });

  it("bevarer trygge Next-chunks, men kanoniserer side-URL-er i stackframes", () => {
    const chunkUrl =
      "https://cdn.nav.no/team-esyfo/dinesykmeldte/_next/static/chunks/app/layout-abc123.js";
    const raw = {
      type: "exception",
      payload: {
        timestamp: "2026-08-30T18:00:00.000Z",
        type: "Error",
        value: "syntetisk feil",
        stacktrace: {
          frames: [
            { filename: `${chunkUrl}?token=hemmelig`, function: "render" },
            {
              filename: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}?bedrift=975289753`,
              function: "anonymous",
            },
          ],
        },
      },
      meta: {},
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    const sanitized = sanitizeBrowserTelemetry(raw);
    const frames = (
      sanitized?.payload as {
        stacktrace: { frames: Array<{ filename: string }> };
      }
    ).stacktrace.frames;

    expect(frames.map((frame) => frame.filename)).toEqual([
      chunkUrl,
      "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}",
    ]);
  });

  it("fjerner DOM- og URL-attribusjon fra web vitals", () => {
    const raw = {
      type: "measurement",
      payload: {
        timestamp: "2026-08-30T18:00:00.000Z",
        type: "web-vitals",
        values: { lcp: 800 },
        context: {
          rating: "good",
          element: `#sykmeldt-${sykmeldtId}`,
          resource_url: `https://www.nav.no/bilde?bedrift=975289753`,
        },
      },
      meta: {},
    } as Parameters<typeof sanitizeBrowserTelemetry>[0];

    expect(sanitizeBrowserTelemetry(raw)?.payload).toEqual(
      expect.objectContaining({ context: { rating: "good" } }),
    );
  });

  it("har eksplisitt identitet, sampling og privacy-safe standardvalg", () => {
    expect(browserApmOptions.app).toBe(BROWSER_APM_APP);
    expect(browserApmOptions.namespace).toBe(BROWSER_APM_NAMESPACE);
    expect(browserApmOptions).not.toHaveProperty("version");
    expect(browserApmOptions).not.toHaveProperty("telemetryUrl");
    expect(browserApmOptions.faro.sessionTracking?.samplingRate).toBe(
      BROWSER_SESSION_SAMPLING_RATE,
    );
    expect(
      browserApmOptions.faro.pageTracking?.generatePageId?.({
        pathname: `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}`,
      } as Location),
    ).toBe("/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}");
    expect(browserApmOptions.dangerouslyDisablePiiScrubbing).toBe(false);
    expect(browserApmOptions.faro.trackResources).toBe(false);
    expect(
      browserApmOptions.faro.webVitalsInstrumentation?.trackAttributionSources,
    ).toBe(false);
    expect(browserApmOptions.sessionReplay.enabled).toBe(false);
    expect(browserApmOptions.screenshotOnError).toBe(false);
    expect(browserApmOptions.tracing).toBe(false);
  });
});
