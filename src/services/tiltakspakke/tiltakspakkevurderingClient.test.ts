import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchTiltakspakkevurderinger } from "./tiltakspakkevurderingClient";

const URL = "/fake/basepath/api/tiltakspakkevurdering";

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

describe("tiltakspakkevurderingClient", () => {
  it("GET: kaller ruten med basePath, signal og GET, og parser svaret", async () => {
    const vurderinger = [
      {
        tiltakspakkeId: "DIALOGMOTE_TILTAKSPAKKE_2",
        virksomheter: [{ orgnummer: "999888777", deltakelse: "TILTAKSGRUPPE" }],
      },
    ];
    fetchMock().mockResolvedValue(okResponse(vurderinger));
    const controller = new AbortController();

    await expect(
      fetchTiltakspakkevurderinger(controller.signal),
    ).resolves.toEqual(vurderinger);

    expect(fetchMock()).toHaveBeenCalledWith(URL, {
      method: "GET",
      signal: controller.signal,
    });
  });

  it("kaster på ikke-2xx-svar", async () => {
    fetchMock().mockResolvedValue(new Response("", { status: 500 }));
    const controller = new AbortController();

    await expect(
      fetchTiltakspakkevurderinger(controller.signal),
    ).rejects.toThrow();
  });

  it("kaster når svaret bryter kontrakten", async () => {
    fetchMock().mockResolvedValue(
      okResponse([{ tiltakspakkeId: "UKJENT", virksomheter: [] }]),
    );
    const controller = new AbortController();

    await expect(
      fetchTiltakspakkevurderinger(controller.signal),
    ).rejects.toThrow();
  });
});
