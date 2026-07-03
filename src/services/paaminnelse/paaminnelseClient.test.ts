import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paaminnelseApi } from "./paaminnelseClient";

// .env.test setter NEXT_PUBLIC_BASE_PATH=/fake/basepath, som brukes som basePath.
const NARMESTELEDER_ID = "narmesteleder-1";
const BASE_URL = `/fake/basepath/api/paaminnelse/${NARMESTELEDER_ID}`;

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fetchMock(): ReturnType<typeof vi.fn> {
  return fetch as unknown as ReturnType<typeof vi.fn>;
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("paaminnelseClient", () => {
  it("GET: kaller ruten med basePath, signal og GET, og parser svaret", async () => {
    fetchMock().mockResolvedValue(
      okResponse({ status: "TILGJENGELIG", synligFra: "2026-05-01", extra: 1 }),
    );
    const controller = new AbortController();

    await expect(
      paaminnelseApi.hentStatus(NARMESTELEDER_ID, controller.signal),
    ).resolves.toEqual({ status: "TILGJENGELIG", synligFra: "2026-05-01" });

    expect(fetchMock()).toHaveBeenCalledWith(BASE_URL, {
      method: "GET",
      signal: controller.signal,
    });
  });

  it("GET: URL-enkoder narmestelederId i pathen", async () => {
    fetchMock().mockResolvedValue(
      okResponse({ status: "SKJULT", synligFra: null }),
    );
    const controller = new AbortController();

    await paaminnelseApi.hentStatus("leder/med mellomrom?", controller.signal);

    expect(fetchMock()).toHaveBeenCalledWith(
      "/fake/basepath/api/paaminnelse/leder%2Fmed%20mellomrom%3F",
      { method: "GET", signal: controller.signal },
    );
  });

  it("POST: bestiller med Content-Type og tom body, uten signal", async () => {
    fetchMock().mockResolvedValue(
      okResponse({ status: "BESTILT", synligFra: null }),
    );

    await expect(paaminnelseApi.bestill(NARMESTELEDER_ID)).resolves.toEqual({
      status: "BESTILT",
      synligFra: null,
    });

    expect(fetchMock()).toHaveBeenCalledWith(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  });

  it("DELETE: avbestiller uten body, headers eller signal", async () => {
    fetchMock().mockResolvedValue(
      okResponse({ status: "TILGJENGELIG", synligFra: null }),
    );

    await expect(paaminnelseApi.avbestill(NARMESTELEDER_ID)).resolves.toEqual({
      status: "TILGJENGELIG",
      synligFra: null,
    });

    expect(fetchMock()).toHaveBeenCalledWith(BASE_URL, { method: "DELETE" });
  });

  it("kaster på ikke-2xx-svar", async () => {
    fetchMock().mockResolvedValue(new Response("", { status: 502 }));
    const controller = new AbortController();

    await expect(
      paaminnelseApi.hentStatus(NARMESTELEDER_ID, controller.signal),
    ).rejects.toThrow();
  });

  it("kaster når svaret bryter kontrakten (ukjent status)", async () => {
    fetchMock().mockResolvedValue(okResponse({ status: "TULL" }));
    const controller = new AbortController();

    await expect(
      paaminnelseApi.hentStatus(NARMESTELEDER_ID, controller.signal),
    ).rejects.toThrow();
  });
});
