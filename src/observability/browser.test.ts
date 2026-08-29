import { describe, expect, it } from "vitest";
import {
  BROWSER_APM_APP,
  BROWSER_APM_NAMESPACE,
  BROWSER_SESSION_SAMPLING_RATE,
  browserApmOptions,
  normalizeBrowserPath,
  scrubBrowserTelemetry,
  scrubTelemetryString,
  UNKNOWN_PAGE_ID,
} from "./browser";

const sykmeldtId = "11111111-1111-4111-8111-111111111111";
const meldingId = "22222222-2222-4222-8222-222222222222";
const opaqueUuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

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
      `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}`,
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}",
    ],
    [
      `/sykmeldt/${sykmeldtId}`,
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

  it("fjerner identifikatorer og URL-detaljer fra alle strengfelt", () => {
    const raw = {
      type: "event",
      payload: {
        name: `Unable to mark ${meldingId} for 01010112345 / leder@nav.no`,
        attributes: {
          toUrl: `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/meldinger?bedrift=975289753`,
          resourceUrl: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/sykmeldinger?_rsc=hemmelig#fragment`,
        },
      },
      meta: {
        user: {
          id: "leder@nav.no",
        },
        page: {
          url: `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/melding/${meldingId}?token=hemmelig`,
        },
      },
    } as Parameters<typeof scrubBrowserTelemetry>[0];

    const scrubbed = scrubBrowserTelemetry(raw);
    if (!scrubbed) throw new Error("Telemetry was unexpectedly dropped");
    const serialized = JSON.stringify(scrubbed);

    expect(serialized).not.toContain(sykmeldtId);
    expect(serialized).not.toContain(meldingId);
    expect(serialized).not.toContain("975289753");
    expect(serialized).not.toContain("hemmelig");
    expect(serialized).not.toContain("01010112345");
    expect(serialized).not.toContain("leder@nav.no");
    expect(serialized).toContain("{sykmeldtId}");
    expect(serialized).toContain("[uuid]");
    expect(serialized).toContain("[fnr]");
    expect(serialized).toContain("[email]");
    expect(scrubbed.meta?.user).toBeUndefined();
    expect(raw.meta?.page?.url).toContain(sykmeldtId);
  });

  it("beholder bare kjente ruter og origin fra URL-er", () => {
    expect(
      scrubTelemetryString(
        `https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}/sykmeldinger?bedrift=975289753#resultat`,
      ),
    ).toBe(
      "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmeldinger",
    );

    expect(
      scrubTelemetryString(
        `GET https://api.nav.no/sak/${sykmeldtId}?code=hemmelig#resultat`,
      ),
    ).toBe("GET https://api.nav.no/{unknown}");

    expect(
      scrubTelemetryString(
        "GET https://leder:hemmelig@api.nav.no/sak/ola%20nordmann/123?bedrift=975289753",
      ),
    ).toBe("GET https://api.nav.no/{unknown}");

    expect(
      scrubTelemetryString(
        `POST /arbeidsgiver/sykmeldte/api/paaminnelse/${opaqueUuid}?token=hemmelig`,
      ),
    ).toBe("POST /arbeidsgiver/sykmeldte/api/paaminnelse/{narmestelederId}");

    expect(
      scrubTelemetryString(
        `//www.nav.no/arbeidsgiver/sykmeldte/${sykmeldtId}?bedrift=975289753`,
      ),
    ).toBe("//www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}");

    expect(
      scrubTelemetryString(
        "https://cdn.nav.no/team-esyfo/dinesykmeldte/_next/static/chunks/hemmelig.js?token=hemmelig",
      ),
    ).toBe("https://cdn.nav.no/arbeidsgiver/sykmeldte/_next/{asset}");

    expect(scrubTelemetryString(`opaque=${opaqueUuid}`)).toBe("opaque=[uuid]");
    expect(scrubTelemetryString("data:text/plain,hemmelig")).toBe("[data-url]");
    expect(scrubTelemetryString("about:blank#leder-ola")).toBe("[about-url]");
    expect(scrubTelemetryString(`blob:https://www.nav.no/${sykmeldtId}`)).toBe(
      "[blob-url]",
    );
  });

  it.each([
    [
      "ftp://leder:hemmelig@host/sak/ola-nordmann?bedrift=975289753",
      "[ftp-url]",
    ],
    ["tel:+4712345678", "[tel-url]"],
    ["urn:person:ola-nordmann", "[urn-url]"],
    ["url=//host/sak/ola?bedrift=975289753", "url=//host/{unknown}"],
    ["url=/sak/ola?bedrift=975289753", "url=/{unknown}"],
    ["url=./sak/ola?bedrift=975289753", "url=/{unknown}"],
    ["url=../sak/ola?bedrift=975289753", "url=/{unknown}"],
    ["url=?bedrift=975289753", "url=/{unknown}"],
    ["url=#leder-ola-nordmann", "url=/{unknown}"],
    ["x=[//host/sak/ola?bedrift=975289753]", "x=[//host/{unknown}]"],
    ["x={/sak/ola?bedrift=975289753}", "x={/{unknown}}"],
    ["path:/sak/ola?bedrift=975289753", "path:/{unknown}"],
    ["query:?bedrift=975289753", "query:/{unknown}"],
    ["fragment:#leder-ola-nordmann", "fragment:/{unknown}"],
    ["http:ola-nordmann?bedrift=975289753", "[http-url]"],
    ["http:/ola-nordmann?bedrift=975289753", "[http-url]"],
    ["https:///ola-nordmann?bedrift=975289753", "[https-url]"],
    ["///ola-nordmann/sak?bedrift=975289753", "[url]"],
    ["////ola-nordmann/sak?bedrift=975289753", "[url]"],
    ["https://\\ola-nordmann/sak?bedrift=975289753", "[https-url]"],
  ])("feiler lukket for URL-referansen %s", (raw, expected) => {
    expect(scrubTelemetryString(raw)).toBe(expected);
  });

  it("beholder diagnostiske felt og en trygg chunk-identitet for sourcemaps", () => {
    expect(scrubTelemetryString("status:403 TypeError:failed-for-ola")).toBe(
      "status:403 TypeError:failed-for-ola",
    );

    const stackUrl =
      "https://cdn.nav.no/team-esyfo/dinesykmeldte/_next/static/chunks/1j6w55fxtm86l.js:123:45";
    const script = document.createElement("script");
    script.src = stackUrl.replace(":123:45", "");
    document.head.append(script);
    try {
      expect(scrubTelemetryString(`at Page (${stackUrl})`)).toBe(
        `at Page (${stackUrl})`,
      );

      for (const spoofedUrl of [
        "https://cdn.nav.no/team-esyfo/dinesykmeldte/ola-nordmann/../_next/static/chunks/1j6w55fxtm86l.js:123:45",
        "https://cdn.nav.no/team-esyfo/dinesykmeldte/ola-nordmann/%2e%2e/_next/static/chunks/1j6w55fxtm86l.js:123:45",
        "https://cdn.nav.no/team-esyfo/dinesykmeldte/ola-nordmann\\..\\_next\\static\\chunks\\1j6w55fxtm86l.js:123:45",
      ]) {
        expect(scrubTelemetryString(spoofedUrl), spoofedUrl).toBe(stackUrl);
        expect(scrubTelemetryString(spoofedUrl)).not.toContain("ola-nordmann");
      }
    } finally {
      script.remove();
    }

    for (const unsafeChunk of [
      "/_next/static/chunks/chunk-Z994488.js:12:34",
      "/_next/static/chunks/ola-nordmann1.js:12:34",
      "/_next/static/chunks/x01010112345.js:12:34",
      "/_next/static/chunks/ola-nordmann.js:12:34?bedrift=975289753",
    ]) {
      expect(scrubTelemetryString(unsafeChunk)).toBe(
        "/arbeidsgiver/sykmeldte/_next/{asset}",
      );
    }
  });

  it("feiler lukket for dype, sirkulære og sensitive objektfelt", () => {
    let deep: Record<string, unknown> = { secret: "01010112345" };
    for (let depth = 0; depth < 15; depth += 1) {
      deep = { nested: deep };
    }

    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const raw = {
      type: "event",
      payload: {
        deep,
        circular,
        [sykmeldtId]: "leder@nav.no",
      },
      meta: {},
    } as Parameters<typeof scrubBrowserTelemetry>[0];

    const scrubbed = scrubBrowserTelemetry(raw);
    const serialized = JSON.stringify(scrubbed);

    expect(serialized).toContain("[truncated]");
    expect(serialized).toContain("[circular]");
    expect(serialized).toContain("[uuid]");
    expect(serialized).toContain("[email]");
    expect(serialized).not.toContain(sykmeldtId);
    expect(serialized).not.toContain("01010112345");
    expect(serialized).not.toContain("leder@nav.no");
  });

  it("har eksplisitt identitet, sampling og privacy-safe standardvalg", () => {
    expect(browserApmOptions.app).toBe(BROWSER_APM_APP);
    expect(browserApmOptions.namespace).toBe(BROWSER_APM_NAMESPACE);
    expect(browserApmOptions.version).toBeTruthy();
    expect(browserApmOptions.faro.sessionTracking?.samplingRate).toBe(
      BROWSER_SESSION_SAMPLING_RATE,
    );
    expect(
      browserApmOptions.faro.pageTracking?.generatePageId?.({
        pathname: `/arbeidsgiver/sykmeldte/sykmeldt/${sykmeldtId}`,
      } as Location),
    ).toBe("/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}");
    expect(BROWSER_SESSION_SAMPLING_RATE).toBe(1);
    expect(browserApmOptions.dangerouslyDisablePiiScrubbing).toBe(false);
    expect(browserApmOptions.sessionReplay.enabled).toBe(false);
    expect(browserApmOptions.screenshotOnError).toBe(false);
    expect(browserApmOptions.tracing).toBe(false);
  });
});
