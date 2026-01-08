import { describe, expect, it, vi } from "vitest";
import { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getVirksomheter } from "./mineSykmeldteService";

vi.mock("@navikt/oasis", () => ({
  requestOboToken: () => ({ ok: true, token: "mock-token" }),
  isInvalidTokenSet: () => false,
}));
const context: ResolverContextType = {
  xRequestId: "mock-request-id",
  accessToken: "mock-token",
  pid: "pid-111",
};
describe("getVirksomheter", () => {
  it("should throw when response is not in 404", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 404,
          statusText: "Not Found",
          ok: false,
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Unknown error from DineSykmeldte Backend, responded with 404 Not Found when fetching virksomheter",
    );
  });

  it("should throw when response is not in 500", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 500,
          statusText: "Internal Server Error",
          ok: false,
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Unknown error from DineSykmeldte Backend, responded with 500 Internal Server Error when fetching virksomheter",
    );
  });

  it("should fall back and log text response when JSON parse fails", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () => Promise.reject("Fake JSON parse error"),
          text: () => Promise.resolve("Some text error"),
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Backend responded with 200 OK, but didn't respond with JSON, text response: Some text error",
    );
  });

  it("should throw error when zod parsing fails", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () => Promise.resolve({ some: "garbage", response: "true" }),
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      /Unable to parse API result, backend responded with: 200 OK, parse error:/,
    );
  });

  it("should be happy when zod parsing succeeds", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () =>
            Promise.resolve([{ navn: "Fakesomehet", orgnummer: "42" }]),
        }) as Response,
    );

    expect(await getVirksomheter(context)).toEqual([
      { navn: "Fakesomehet", orgnummer: "42" },
    ]);
  });
});
