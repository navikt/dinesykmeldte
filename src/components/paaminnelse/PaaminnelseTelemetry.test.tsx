import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recordAidPaaminnelse } from "../../observability/aidTelemetry";
import PaaminnelseModul from "./PaaminnelseModul";

vi.mock("../../observability/aidTelemetry", () => ({
  recordAidPaaminnelse: vi.fn(),
}));
const fetchMock = vi.fn();
const orgnummer = "999888777";
const narmestelederId = "local-context-only";
const ok = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });
const mount = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const result = render(
    <StrictMode>
      <PaaminnelseModul
        orgnummer={orgnummer}
        narmestelederId={narmestelederId}
      />
    </StrictMode>,
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    },
  );
  return { ...result, queryClient };
};
const events = () =>
  vi.mocked(recordAidPaaminnelse).mock.calls.map(([event]) => event);

beforeEach(() => {
  vi.mocked(recordAidPaaminnelse).mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("Reminder actions", () => {
  it("does not apply an in-flight order to the next reminder context", async () => {
    let completeOrder!: (response: Response) => void;
    const orderResponse = new Promise<Response>((resolve) => {
      completeOrder = resolve;
    });
    fetchMock
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }))
      .mockReturnValueOnce(orderResponse)
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }));
    const { rerender, queryClient } = mount();
    await userEvent.click(
      await screen.findByRole("button", { name: "Ja, minn meg på det" }),
    );
    rerender(
      <StrictMode>
        <PaaminnelseModul
          orgnummer={orgnummer}
          narmestelederId="next-context"
        />
      </StrictMode>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(
      await screen.findByRole("button", { name: /Ja, minn meg på det/ }),
    ).toBeDisabled();
    await act(async () => {
      completeOrder(ok({ status: "BESTILT" }));
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData(["paaminnelse", narmestelederId]),
      ).toEqual({ status: "BESTILT" }),
    );
    expect(queryClient.getQueryData(["paaminnelse", "next-context"])).toEqual({
      status: "TILGJENGELIG",
    });
    expect(
      screen.queryByRole("button", { name: "Skru av påminnelsen" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ja, minn meg på det" }),
    ).toBeInTheDocument();
    expect(
      events()
        .filter((event) => event.hendelse === "bestill")
        .map((event) => event.utfall),
    ).toEqual(["forsok", "bekreftet"]);
    expect(JSON.stringify(events())).not.toContain("next-context");
  });

  it("records each order and cancellation once through StrictMode, without identifiers", async () => {
    fetchMock
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }))
      .mockResolvedValueOnce(ok({ status: "BESTILT" }))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }));
    mount();
    const bestill = await screen.findByRole("button", {
      name: "Ja, minn meg på det",
    });
    await userEvent.click(bestill);
    await userEvent.click(
      await screen.findByRole("button", { name: "Skru av påminnelsen" }),
    );
    await screen.findByRole("button", { name: "Ja, minn meg på det" });

    expect(events()).toEqual([
      {
        variant: "aid",
        hendelse: "bestill",
        paaminnelsevalg: "ikke_bestilt",
        utfall: "forsok",
      },
      {
        variant: "aid",
        hendelse: "bestill",
        paaminnelsevalg: "ikke_bestilt",
        utfall: "bekreftet",
      },
      {
        variant: "aid",
        hendelse: "avbestill",
        paaminnelsevalg: "bestilt",
        utfall: "forsok",
      },
      {
        variant: "aid",
        hendelse: "avbestill",
        paaminnelsevalg: "bestilt",
        utfall: "bekreftet",
      },
    ]);
    expect(JSON.stringify(events())).not.toContain(orgnummer);
    expect(JSON.stringify(events())).not.toContain(narmestelederId);
  });

  it.each(["http_error", "unexpected_status", "unchanged_status"])(
    "does not count %s as a confirmed order",
    async (scenario) => {
      fetchMock
        .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }))
        .mockResolvedValueOnce(
          scenario === "http_error"
            ? new Response(null, { status: 500 })
            : ok({
                status:
                  scenario === "unchanged_status" ? "TILGJENGELIG" : "SKJULT",
              }),
        );
      mount();
      await userEvent.click(
        await screen.findByRole("button", { name: "Ja, minn meg på det" }),
      );
      await waitFor(() =>
        expect(events().filter((it) => it.hendelse === "bestill")).toHaveLength(
          2,
        ),
      );
      expect(
        events()
          .filter((it) => it.hendelse === "bestill")
          .map((it) => it.utfall),
      ).toEqual([
        "forsok",
        scenario === "http_error" ? "feilet" : "ikke_bekreftet",
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );
});
