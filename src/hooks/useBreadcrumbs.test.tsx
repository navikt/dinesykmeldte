import {
  onBreadcrumbClick,
  setBreadcrumbs,
} from "@navikt/nav-dekoratoren-moduler";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { overrideWindowLocation } from "../utils/test/locationUtils";
import {
  createInitialServerSideBreadcrumbs,
  SsrPathVariants,
  useHandleDecoratorClicks,
  useUpdateBreadcrumbs,
} from "./useBreadcrumbs";

const { logAmplitudeEventMock } = vi.hoisted(() => ({
  logAmplitudeEventMock: vi.fn(),
}));

// Partial mock: behold ekte sanitizeDestination-logikk for regresjonstest mot PII-lekkasje,
// men mock logAmplitudeEvent slik at vi kan inspisere kall.
vi.mock("../amplitude/amplitude", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../amplitude/amplitude")>();
  return {
    ...original,
    logAmplitudeEvent: logAmplitudeEventMock,
  };
});

describe("useUpdateBreadcrumbs", () => {
  overrideWindowLocation("/sykmeldt/test-sykmeldt/sykmeldinger");

  it("shall update when given a single crumb, automatically setting the URL", () => {
    const spy = vi.mocked(setBreadcrumbs);
    renderHook(() => useUpdateBreadcrumbs(() => [{ title: "Test Crumb 1" }]));

    expect(spy).toHaveBeenCalledWith([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      { handleInApp: true, title: "Test Crumb 1", url: "/" },
    ]);
  });

  it("shall update when given two crumbs, automatically setting the URL for the last crumb", () => {
    const spy = vi.mocked(setBreadcrumbs);
    renderHook(() =>
      useUpdateBreadcrumbs(() => [
        { title: "Test Crumb 1", url: "/first/path" },
        { title: "Test Crumb 2" },
      ]),
    );

    expect(spy).toHaveBeenCalledWith([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Test Crumb 1",
        url: "/fake/basepath/first/path",
      },
      { handleInApp: true, title: "Test Crumb 2", url: "/" },
    ]);
  });

  it("shall update when given multiple crumbs, automatically setting the URL for the last crumb", () => {
    const spy = vi.mocked(setBreadcrumbs);
    renderHook(() =>
      useUpdateBreadcrumbs(() => [
        { title: "Test Crumb 1", url: "/first/path" },
        { title: "Test Crumb 2", url: "/second/path" },
        { title: "Test Crumb 3" },
      ]),
    );

    expect(spy).toHaveBeenCalledWith([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Test Crumb 1",
        url: "/fake/basepath/first/path",
      },
      {
        handleInApp: true,
        title: "Test Crumb 2",
        url: "/fake/basepath/second/path",
      },
      { handleInApp: true, title: "Test Crumb 3", url: "/" },
    ]);
  });
});

describe("createInitialServerSideBreadcrumbs", () => {
  it("should create correct crumbs for sykmeldinger page", () => {
    const result = createInitialServerSideBreadcrumbs(
      SsrPathVariants.Sykmeldinger,
      { sykmeldtId: "test-id" },
    );

    expect(result).toEqual([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Den sykmeldte",
        analyticsTitle: "Den sykmeldte",
        url: "/fake/basepath/sykmeldt/test-id",
      },
      { handleInApp: true, title: "Sykmeldinger", url: "/" },
    ]);
  });

  it("should create correct crumbs for søknader page", () => {
    const result = createInitialServerSideBreadcrumbs(
      SsrPathVariants.Soknader,
      { sykmeldtId: "test-id" },
    );

    expect(result).toEqual([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Den sykmeldte",
        analyticsTitle: "Den sykmeldte",
        url: "/fake/basepath/sykmeldt/test-id",
      },
      { handleInApp: true, title: "Søknader", url: "/" },
    ]);
  });

  it("should create correct crumbs for sykmelding page", () => {
    const result = createInitialServerSideBreadcrumbs(
      SsrPathVariants.Sykmelding,
      { sykmeldtId: "sykmeldt-id-1" },
    );

    expect(result).toEqual([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Sykmeldtes sykmeldinger",
        analyticsTitle: "Den sykmeldtes sykmeldinger",
        url: "/fake/basepath/sykmeldt/sykmeldt-id-1/sykmeldinger",
      },
      { handleInApp: true, title: "Sykmelding", url: "/" },
    ]);
  });

  it("should create correct crumbs for søknad page", () => {
    const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Soknad, {
      sykmeldtId: "sykmeldt-id-1",
    });

    expect(result).toEqual([
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
      {
        handleInApp: true,
        title: "Sykmeldtes søknader",
        analyticsTitle: "Den sykmeldtes søknader",
        url: "/fake/basepath/sykmeldt/sykmeldt-id-1/soknader",
      },
      { handleInApp: true, title: "Søknad", url: "/" },
    ]);
  });

  it("should create correct crumbs for root, 505 and 400", () => {
    const root = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {});
    const serverError = createInitialServerSideBreadcrumbs(
      SsrPathVariants.Root,
      {},
    );
    const notFound = createInitialServerSideBreadcrumbs(
      SsrPathVariants.Root,
      {},
    );

    const rootCrumb = [
      { handleInApp: true, title: "Dine sykmeldte", url: "/fake/basepath" },
    ];

    expect(root).toEqual(rootCrumb);
    expect(serverError).toEqual(rootCrumb);
    expect(notFound).toEqual(rootCrumb);
  });
});

/**
 * Regresjonstester for inspeksjonsfunnet om breadcrumb-`destinasjon`:
 * Breadcrumb-klikk skal aldri sende rå sykmeldtId, narmestelederId eller andre
 * dynamiske ID-segmenter som `destinasjon` til Amplitude.
 */
describe("useHandleDecoratorClicks – destinasjon-sanering", () => {
  it("sender ikke rå sykmeldtId i destinasjon ved breadcrumb-klikk", async () => {
    const sykmeldtId = "abc-123-def-456-ghi";
    renderHook(() => useHandleDecoratorClicks());

    const registeredCallback = vi.mocked(onBreadcrumbClick).mock.calls[0]?.[0];
    expect(registeredCallback).toBeDefined();

    await act(async () => {
      registeredCallback({
        title: "Den sykmeldte",
        url: `/fake/basepath/sykmeldt/${sykmeldtId}/sykmeldinger`,
        handleInApp: true,
      });
    });

    expect(logAmplitudeEventMock).toHaveBeenCalledOnce();
    const [eventArg] = logAmplitudeEventMock.mock.calls[0];
    expect(eventArg.eventName).toBe("navigere");
    // Sørger for at den rå UUID-en ikke er med i destinasjon
    expect(eventArg.data.destinasjon).not.toContain(sykmeldtId);
    // Sørger for at stien er sanert til template-format
    expect(eventArg.data.destinasjon).toBe(
      "/fake/basepath/sykmeldt/[id]/sykmeldinger",
    );
  });

  it("sender ikke narmestelederId eller andre dynamiske ID-er i destinasjon", async () => {
    const narmestelederId = "narmesteleder-uuid-9876";
    renderHook(() => useHandleDecoratorClicks());

    const registeredCallback = vi.mocked(onBreadcrumbClick).mock.calls[0]?.[0];
    await act(async () => {
      registeredCallback({
        title: "Dine sykmeldte",
        url: `/fake/basepath/sykmeldt/${narmestelederId}`,
        handleInApp: true,
      });
    });

    const [eventArg] = logAmplitudeEventMock.mock.calls[0];
    expect(eventArg.data.destinasjon).not.toContain(narmestelederId);
    // /sykmeldt/<id> is now a recognized two-segment pattern → precise sanitization
    expect(eventArg.data.destinasjon).toBe("/fake/basepath/sykmeldt/[id]");
  });

  it("sender sanitert lenketekst og analyticsTitle som lenketekst", async () => {
    renderHook(() => useHandleDecoratorClicks());

    const registeredCallback = vi.mocked(onBreadcrumbClick).mock.calls[0]?.[0];
    await act(async () => {
      registeredCallback({
        title: "Rå personnamn",
        analyticsTitle: "Den sykmeldte",
        url: "/fake/basepath/sykmeldt/some-uuid/sykmeldinger",
        handleInApp: true,
      });
    });

    const [eventArg] = logAmplitudeEventMock.mock.calls[0];
    // analyticsTitle skal brukes fremfor den rå titelen
    expect(eventArg.data.lenketekst).toBe("Den sykmeldte");
  });
});
