import "vitest-dom/extend-expect";

import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";
import pino from "pino";
import pretty from "pino-pretty";
import { afterEach, beforeEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/matchers";

import { cleanup } from "./src/utils/test/testUtils";

const akselAccordionWarningText =
  "Accordions should have more than one item. Consider using ExpansionPanel instead.";

const isSideMenuAccordionElement = (arg: unknown): boolean => {
  if (!(arg instanceof HTMLElement)) return false;
  if (typeof arg.className !== "string") return false;

  return (
    arg.className.includes("mobileMenuAccordion") ||
    arg.className.includes("accordionMobileRoot")
  );
};

const shouldIgnoreAkselAccordionWarning = (args: unknown[]): boolean =>
  args.some(
    (arg) =>
      (typeof arg === "string" && arg.includes(akselAccordionWarningText)) ||
      (arg instanceof Error && arg.message.includes(akselAccordionWarningText)),
  ) && args.some(isSideMenuAccordionElement);

beforeEach(() => {
  const originalConsoleWarn = console.warn.bind(console);
  const originalConsoleError = console.error.bind(console);

  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (shouldIgnoreAkselAccordionWarning(args)) return;

    originalConsoleWarn(...args);
  });

  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (shouldIgnoreAkselAccordionWarning(args)) return;

    originalConsoleError(...args);
  });
});

vi.mock("@navikt/next-logger", async () => {
  const actual = (await vi.importActual(
    "@navikt/next-logger",
  )) satisfies typeof import("@navikt/next-logger");

  return {
    ...actual,
    logger: pino(pretty({ sync: true, minimumLevel: "error" })),
  };
});

/** Patching some jsdom globals */
// biome-ignore lint/suspicious/noExplicitAny: Patching global object requires any type
const dirtyGlobal = global as any;

dirtyGlobal.scrollTo = vi.fn().mockImplementation(() => 0);
dirtyGlobal.HTMLElement.prototype.scrollIntoView = () => {};

expect.extend(matchers);

// biome-ignore lint/correctness/useHookAtTopLevel: This is test setup, not a React component
mockRouter.useParser(
  createDynamicRouteParser([
    "/sykmeldt/[sykmeldtId]",
    "/sykmeldt/[sykmeldtId]/soknader",
    "/sykmeldt/[sykmeldtId]/sykmeldinger",
    "/sykmeldt/[sykmeldtId]/soknad/[soknadId]",
    "/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]",
  ]),
);

// Custom rewrites to mimic the behaviour of the server
// biome-ignore lint/correctness/useHookAtTopLevel: This is test setup, not a React component
mockRouter.useParser((url) => {
  if (url.pathname === "/") {
    url.query.sykmeldtId = "null";
  }
  if (url.pathname === "/sykmeldt/:sykmeldtId") {
    url.pathname = "/:sykmeldtId";
  }
  return url;
});

vi.mock("graphql", () => vi.importActual("graphql/index.js"));
vi.mock("next/router", () => vi.importActual("next-router-mock"));
vi.mock("next/dist/client/router", () => vi.importActual("next-router-mock"));

// Mock nav-dekoratoren-moduler to prevent timers from running in tests
vi.mock("@navikt/nav-dekoratoren-moduler", () => ({
  setBreadcrumbs: vi.fn(),
  onBreadcrumbClick: vi.fn(),
  setAvailableLanguages: vi.fn(),
  setParams: vi.fn(),
  logAmplitudeEvent: vi.fn(),
  getCurrentConsent: vi.fn(() =>
    Promise.resolve({ analytics: false, marketing: false }),
  ),
}));

// vitest doesn't do this automatically :)
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});

process.env.DEBUG_PRINT_LIMIT = "30000";
