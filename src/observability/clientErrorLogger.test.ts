import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendClientErrorToBackend } from "./clientErrorLogger";

describe("sendClientErrorToBackend", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sender en strukturert error til backend uten console.error", () => {
    const consoleError = vi.spyOn(console, "error");
    const error = new Error("syntetisk feil");

    sendClientErrorToBackend(error, "Kun backend", {
      componentStack: "at ThrowingChild",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/fake/basepath/api/logger");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      level: { label: "error", value: 50 },
      bindings: [],
      messages: [
        {
          err: {
            type: "Error",
            message: "syntetisk feil",
            stack: expect.stringContaining("syntetisk feil"),
          },
          componentStack: "at ThrowingChild",
        },
        "Kun backend",
      ],
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("logger ikke en ny feil dersom backendkallet feiler", async () => {
    const consoleError = vi.spyOn(console, "error");
    fetchMock.mockRejectedValue(new Error("nettverksfeil"));

    sendClientErrorToBackend("opprinnelig feil", "Kun backend");
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
