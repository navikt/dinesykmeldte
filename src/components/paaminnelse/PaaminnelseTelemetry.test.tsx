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
const callbacks = new Set<IntersectionObserverCallback>();
const fetchMock = vi.fn();
const orgnummer = "999888777";
const narmestelederId = "local-context-only";
const ok = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });
const vurdering = (deltakelse = "TILTAKSGRUPPE") => [
  {
    tiltakspakkeId: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
    virksomheter: [{ orgnummer, deltakelse }],
  },
];
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
const intersect = () => {
  for (const callback of Array.from(callbacks))
    callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
};

beforeEach(() => {
  callbacks.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        callbacks.add(this.callback);
      }
      disconnect() {
        callbacks.delete(this.callback);
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("Reminder delivery and usage", () => {
  it("ignores an observer callback queued before unmount", async () => {
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }));
    const { unmount } = mount();
    await screen.findByRole("button", { name: "Ja, minn meg på det" });
    const queuedCallback = Array.from(callbacks)[0];
    unmount();
    queuedCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(events().map((event) => event.hendelse)).toEqual(["beslutning"]);
  });

  it("does not apply an in-flight order to the next reminder context", async () => {
    let completeOrder!: (response: Response) => void;
    const orderResponse = new Promise<Response>((resolve) => {
      completeOrder = resolve;
    });
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
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
    await waitFor(() =>
      expect(
        events().filter((event) => event.hendelse === "beslutning"),
      ).toHaveLength(2),
    );
    expect(
      screen.getByRole("button", { name: /Ja, minn meg på det/ }),
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
  });
  it("does not invent a view when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }));
    mount();
    await screen.findByRole("button", { name: "Ja, minn meg på det" });
    expect(events().map((event) => event.hendelse)).toEqual(["beslutning"]);
  });

  it("counts a new context but not an old disconnected observer", async () => {
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }))
      .mockResolvedValueOnce(ok({ status: "BESTILT" }));
    const { rerender } = mount();
    await screen.findByRole("button", { name: "Ja, minn meg på det" });
    const oldCallback = Array.from(callbacks)[0];
    intersect();
    rerender(
      <StrictMode>
        <PaaminnelseModul
          orgnummer={orgnummer}
          narmestelederId="another-local-context"
        />
      </StrictMode>,
    );
    await screen.findByRole("button", { name: "Skru av påminnelsen" });
    oldCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(events().filter((event) => event.hendelse === "vist")).toHaveLength(
      1,
    );
    intersect();
    expect(events().filter((event) => event.hendelse === "vist")).toHaveLength(
      2,
    );
    expect(
      events().filter((event) => event.hendelse === "beslutning"),
    ).toHaveLength(2);
    expect(JSON.stringify(events())).not.toContain("another-local-context");
  });

  it("keeps a status fetch error separate from hidden or missing assignment", async () => {
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    mount();
    await waitFor(() => expect(events()).toHaveLength(1));
    expect(events()[0]).toMatchObject({
      gruppe: "tiltak",
      variant: "skjult",
      paaminnelsevalg: "ukjent",
      utfall: "status_feilet",
    });
    expect(callbacks.size).toBe(0);
  });

  it("waits for viewport visibility and counts one view through StrictMode and state updates", async () => {
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }))
      .mockResolvedValueOnce(ok({ status: "BESTILT" }))
      .mockResolvedValueOnce(ok({ status: "TILGJENGELIG" }));
    mount();
    const bestill = await screen.findByRole("button", {
      name: "Ja, minn meg på det",
    });
    expect(events().filter((it) => it.hendelse === "beslutning")).toHaveLength(
      1,
    );
    expect(events().filter((it) => it.hendelse === "vist")).toHaveLength(0);
    intersect();
    intersect();
    expect(events().filter((it) => it.hendelse === "vist")).toEqual([
      {
        gruppe: "tiltak",
        variant: "aid",
        hendelse: "vist",
        paaminnelsevalg: "ikke_bestilt",
        utfall: "tilgjengelig",
      },
    ]);
    await userEvent.click(bestill);
    await userEvent.click(
      await screen.findByRole("button", { name: "Skru av påminnelsen" }),
    );
    await screen.findByRole("button", { name: "Ja, minn meg på det" });
    expect(
      events()
        .filter((it) => it.hendelse === "bestill")
        .map((it) => it.utfall),
    ).toEqual(["forsok", "bekreftet"]);
    expect(events().filter((it) => it.hendelse === "avbestill")).toEqual([
      {
        gruppe: "tiltak",
        variant: "aid",
        hendelse: "avbestill",
        paaminnelsevalg: "bestilt",
        utfall: "forsok",
      },
      {
        gruppe: "tiltak",
        variant: "aid",
        hendelse: "avbestill",
        paaminnelsevalg: "bestilt",
        utfall: "bekreftet",
      },
    ]);
    expect(events().filter((it) => it.hendelse === "vist")).toHaveLength(1);
    expect(JSON.stringify(events())).not.toContain(orgnummer);
    expect(JSON.stringify(events())).not.toContain(narmestelederId);
  });

  it.each([
    ["KONTROLLGRUPPE", "kontroll"],
    ["UTENFOR_SCOPE", "utenfor_scope"],
  ])("keeps %s separate without fabricating a reminder choice", async (assignment, gruppe) => {
    fetchMock.mockResolvedValueOnce(ok(vurdering(assignment)));
    mount();
    await waitFor(() => expect(events()).toHaveLength(1));
    expect(events()[0]).toEqual({
      gruppe,
      variant: "skjult",
      hendelse: "beslutning",
      paaminnelsevalg: "ikke_tilbudt",
      utfall: "skjult",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(0);
  });

  it("does not classify an empty/fail-closed assignment as control", async () => {
    fetchMock.mockResolvedValueOnce(ok([]));
    mount();
    await waitFor(() => expect(events()).toHaveLength(1));
    expect(events()[0]).toMatchObject({
      gruppe: "ukjent",
      variant: "skjult",
      paaminnelsevalg: "ukjent",
      utfall: "vurdering_mangler",
    });
  });

  it.each([
    "http_error",
    "unexpected_status",
    "unchanged_status",
  ])("does not count %s as a confirmed order", async (scenario) => {
    fetchMock
      .mockResolvedValueOnce(ok(vurdering()))
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
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
