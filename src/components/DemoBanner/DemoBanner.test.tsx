import { logger } from "@navikt/next-logger";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { TILTAKSPAKKEVURDERING_QUERY_KEY } from "../../services/tiltakspakke/useTiltakspakke";
import { DEMO_SCENARIO_COOKIE_NAME } from "../../utils/demoScenario";
import { DemoBanner } from "./DemoBanner";

const SELECTOR_NAME = /Demoscenario/i;
const INVALIDATION_FAILED_MESSAGE =
  "Failed to invalidate tiltakspakkevurdering query after demo scenario change";

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithQueryClient(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
): { queryClient: QueryClient } & ReturnType<typeof render> {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
}

describe("DemoBanner", () => {
  it("viser demo-banneret med demoscenario-velgeren satt til standard som utgangspunkt", () => {
    renderWithQueryClient(<DemoBanner />);

    expect(
      screen.getByText(
        "Dette er en demoside og inneholder ikke dine personlige data.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: SELECTOR_NAME })).toHaveValue(
      "default",
    );
  });

  it("respekterer det server-avledede initialDemoScenario=tiltakspakke-2", () => {
    renderWithQueryClient(<DemoBanner initialDemoScenario="tiltakspakke-2" />);

    expect(screen.getByRole("combobox", { name: SELECTOR_NAME })).toHaveValue(
      "tiltakspakke-2",
    );
  });

  it("tilbyr nøyaktig de to kjente scenarioene som valg", () => {
    renderWithQueryClient(<DemoBanner />);

    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options.map((option) => option.value)).toEqual([
      "default",
      "tiltakspakke-2",
    ]);
  });

  it("skriver sesjonscookien (uten expires/max-age) og invaliderer tiltakspakkevurdering-nøkkelen når scenario endres til tiltakspakke-2", async () => {
    const cookieSetSpy = vi.spyOn(document, "cookie", "set");
    const { queryClient } = renderWithQueryClient(
      <DemoBanner initialDemoScenario="default" />,
    );
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.change(screen.getByRole("combobox", { name: SELECTOR_NAME }), {
      target: { value: "tiltakspakke-2" },
    });

    expect(cookieSetSpy).toHaveBeenCalledTimes(1);
    const writtenCookie = cookieSetSpy.mock.calls[0]?.[0];
    expect(writtenCookie).toMatch(
      new RegExp(`^${DEMO_SCENARIO_COOKIE_NAME}=tiltakspakke-2; path=`),
    );
    expect(writtenCookie).not.toMatch(/expires|max-age/i);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: TILTAKSPAKKEVURDERING_QUERY_KEY,
    });
  });

  it("skriver cookieverdien default og invaliderer den samme nøkkelen når scenario endres tilbake til standard", async () => {
    const cookieSetSpy = vi.spyOn(document, "cookie", "set");
    const { queryClient } = renderWithQueryClient(
      <DemoBanner initialDemoScenario="tiltakspakke-2" />,
    );
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.change(screen.getByRole("combobox", { name: SELECTOR_NAME }), {
      target: { value: "default" },
    });

    expect(cookieSetSpy).toHaveBeenCalledTimes(1);
    const writtenCookie = cookieSetSpy.mock.calls[0]?.[0];
    expect(writtenCookie).toMatch(
      new RegExp(`^${DEMO_SCENARIO_COOKIE_NAME}=default; path=`),
    );

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: TILTAKSPAKKEVURDERING_QUERY_KEY,
    });
  });

  it("holder velgeren deaktivert mens invalideringen pågår, og gjenoppretter den når den fullføres", async () => {
    const queryClient = createTestQueryClient();
    let resolveInvalidation: () => void = () => undefined;
    vi.spyOn(queryClient, "invalidateQueries").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveInvalidation = resolve;
        }),
    );
    renderWithQueryClient(
      <DemoBanner initialDemoScenario="default" />,
      queryClient,
    );
    const select = screen.getByRole("combobox", { name: SELECTOR_NAME });

    fireEvent.change(select, { target: { value: "tiltakspakke-2" } });

    expect(select).toBeDisabled();

    resolveInvalidation();
    await waitFor(() => {
      expect(select).not.toBeDisabled();
    });
  });

  it("logger en fast, ikke-sensitiv feilmelding og gjenoppretter interaktiv tilstand når invalideringen feiler", async () => {
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {
      // Intentional no-op: assert on the call instead of the log side effect.
    });
    const queryClient = createTestQueryClient();
    vi.spyOn(queryClient, "invalidateQueries").mockRejectedValue(
      new Error("boom"),
    );
    renderWithQueryClient(
      <DemoBanner initialDemoScenario="default" />,
      queryClient,
    );
    const select = screen.getByRole("combobox", { name: SELECTOR_NAME });

    fireEvent.change(select, { target: { value: "tiltakspakke-2" } });

    await waitFor(() => {
      expect(select).not.toBeDisabled();
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(INVALIDATION_FAILED_MESSAGE);
  });
});
