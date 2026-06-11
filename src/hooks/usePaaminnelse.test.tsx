import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePaaminnelse } from "./usePaaminnelse";

const ROUTE_PARAM = "narmesteleder-1";
const API_URL = `/fake/basepath/api/paaminnelse/${ROUTE_PARAM}`;
const OTHER_ROUTE_PARAM = "narmesteleder-2";
const OTHER_API_URL = `/fake/basepath/api/paaminnelse/${OTHER_ROUTE_PARAM}`;

beforeEach(() => {
  global.fetch = vi.fn(async () => jsonResponse({ status: "SKJULT" }));
});

describe("usePaaminnelse", () => {
  it("fetches status with public base path", async () => {
    global.fetch = vi.fn(async () => jsonResponse({ status: "TILBUD" }));

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));

    expect(result.current.status).toBe("laster");

    await waitFor(() => expect(result.current.status).toBe("tilbud"));

    expect(global.fetch).toHaveBeenCalledWith(API_URL);
    expect(result.current.paaminnelse).toEqual({ status: "TILBUD" });
    expect(result.current.inlineError).toBeNull();
  });

  it("hides module when API returns SKJULT", async () => {
    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));

    await waitFor(() => expect(result.current.status).toBe("skjult"));

    expect(result.current.paaminnelse).toBeNull();
  });

  it("hides module when GET fails or returns invalid response", async () => {
    global.fetch = vi.fn(async () =>
      jsonResponse({ status: "BESTILT", fnr: "00000000000" }),
    );

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));

    await waitFor(() => expect(result.current.status).toBe("skjult"));
  });

  it("does not fetch when narmestelederId is missing", async () => {
    const { result } = renderHook(() => usePaaminnelse(null));

    await waitFor(() => expect(result.current.status).toBe("skjult"));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("bestiller paaminnelse and updates state from response", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "TILBUD" }))
      .mockResolvedValueOnce(
        jsonResponse({
          status: "BESTILT",
          reminderTiming: { code: "BEFORE_4_WEEKS" },
        }),
      );

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));
    await waitFor(() => expect(result.current.status).toBe("tilbud"));

    await act(async () => {
      await result.current.bestill();
    });

    expect(result.current.status).toBe("bestilt");
    expect(result.current.paaminnelse).toEqual({
      status: "BESTILT",
      reminderTiming: { code: "BEFORE_4_WEEKS" },
    });
    expect(global.fetch).toHaveBeenLastCalledWith(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  });

  it("avbestiller paaminnelse and updates state from response", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "BESTILT" }))
      .mockResolvedValueOnce(jsonResponse({ status: "TILBUD" }));

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));
    await waitFor(() => expect(result.current.status).toBe("bestilt"));

    await act(async () => {
      await result.current.avbestill();
    });

    expect(result.current.status).toBe("tilbud");
    expect(global.fetch).toHaveBeenLastCalledWith(API_URL, {
      method: "DELETE",
    });
  });

  it("shows inline error and preserves state when bestilling fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "TILBUD" }))
      .mockResolvedValueOnce(
        jsonResponse({ feilkode: "BESTILLING_FEILET" }, { status: 502 }),
      );

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));
    await waitFor(() => expect(result.current.status).toBe("tilbud"));

    await act(async () => {
      await result.current.bestill();
    });

    expect(result.current.status).toBe("tilbud");
    expect(result.current.inlineError).toBe("BESTILLING_FEILET");
    expect(result.current.isMutating).toBe(false);
  });

  it("shows inline error and preserves state when avbestilling fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "BESTILT" }))
      .mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));
    await waitFor(() => expect(result.current.status).toBe("bestilt"));

    await act(async () => {
      await result.current.avbestill();
    });

    expect(result.current.status).toBe("bestilt");
    expect(result.current.inlineError).toBe("AVBESTILLING_FEILET");
    expect(result.current.isMutating).toBe(false);
  });

  it("refetches status on demand", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "TILBUD" }))
      .mockResolvedValueOnce(jsonResponse({ status: "BESTILT" }));

    const { result } = renderHook(() => usePaaminnelse(ROUTE_PARAM));
    await waitFor(() => expect(result.current.status).toBe("tilbud"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.status).toBe("bestilt");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("ignores stale GET response when narmestelederId changes", async () => {
    const firstRequest = createDeferred<Response>();
    global.fetch = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce(jsonResponse({ status: "BESTILT" }));

    const { result, rerender } = renderHook(
      ({ narmestelederId }) => usePaaminnelse(narmestelederId),
      {
        initialProps: { narmestelederId: ROUTE_PARAM },
      },
    );

    rerender({ narmestelederId: OTHER_ROUTE_PARAM });
    await waitFor(() => expect(result.current.status).toBe("bestilt"));

    await act(async () => {
      firstRequest.resolve(
        new Response(JSON.stringify({ status: "TILBUD" }), {
          headers: { "Content-Type": "application/json" },
        }),
      );
      await firstRequest.promise;
    });

    expect(result.current.status).toBe("bestilt");
    expect(global.fetch).toHaveBeenNthCalledWith(1, API_URL);
    expect(global.fetch).toHaveBeenNthCalledWith(2, OTHER_API_URL);
  });

  it("ignores stale mutation response when narmestelederId changes", async () => {
    const bestillRequest = createDeferred<Response>();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: "TILBUD" }))
      .mockReturnValueOnce(bestillRequest.promise)
      .mockResolvedValueOnce(jsonResponse({ status: "BESTILT" }));

    const { result, rerender } = renderHook(
      ({ narmestelederId }) => usePaaminnelse(narmestelederId),
      {
        initialProps: { narmestelederId: ROUTE_PARAM },
      },
    );
    await waitFor(() => expect(result.current.status).toBe("tilbud"));

    await act(async () => {
      void result.current.bestill();
    });
    rerender({ narmestelederId: OTHER_ROUTE_PARAM });
    await waitFor(() => expect(result.current.status).toBe("bestilt"));

    await act(async () => {
      bestillRequest.resolve(
        new Response(JSON.stringify({ status: "TILBUD" }), {
          headers: { "Content-Type": "application/json" },
        }),
      );
      await bestillRequest.promise;
    });

    expect(result.current.status).toBe("bestilt");
  });
});

function jsonResponse(body: unknown, init?: ResponseInit): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}
