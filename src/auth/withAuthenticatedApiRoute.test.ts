import * as oasis from "@navikt/oasis";
import type { JWTPayload } from "jose";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "./withAuthenticatedApiRoute";

vi.mock("../utils/env", () => ({
  isLocalOrDemo: false,
}));

vi.mock("@navikt/oasis", async () => {
  const actual = (await vi.importActual(
    "@navikt/oasis",
  )) satisfies typeof import("@navikt/oasis");

  return {
    validateToken: vi.fn(),
    getToken: actual.getToken,
    parseIdportenToken: vi.fn(),
  };
});

const mockedValidateToken = oasis.validateToken as unknown as Mock<
  typeof oasis.validateToken
>;
const mockedParseIdportenToken = oasis.parseIdportenToken as unknown as Mock<
  typeof oasis.parseIdportenToken
>;

describe("withAuthenticatedAppRoute", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockedParseIdportenToken.mockReturnValue({
      ok: true,
      pid: "12345abced",
    } satisfies ReturnType<typeof oasis.parseIdportenToken>);
  });

  it("should give 401 when token is missing", async () => {
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const request = new Request("http://localhost/api/graphql");

    const response = await withAuthenticatedApiRoute(handler)(
      request,
      undefined,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Access denied",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("should give 401 when token is invalid", async () => {
    mockedValidateToken.mockImplementation(
      async () =>
        ({
          ok: false,
          errorType: "unknown",
          error: new Error("wrong client id"),
        }) satisfies oasis.ValidationResult,
    );

    const handler = vi.fn(async () => Response.json({ ok: true }));
    const request = new Request("http://localhost/api/graphql", {
      headers: {
        authorization: "Bearer test-token",
      },
    });

    const response = await withAuthenticatedApiRoute(handler)(
      request,
      undefined,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Access denied",
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("should invoke handler when token is valid", async () => {
    const payload: JWTPayload = {
      pid: "12345abced",
    };
    mockedValidateToken.mockImplementation(
      async (): Promise<oasis.ValidationResult> => ({
        ok: true,
        payload: payload,
      }),
    );

    const handler = vi.fn(async () => Response.json({ ok: true }));
    const request = new Request("http://localhost/api/graphql", {
      headers: {
        authorization: "Bearer test-token",
      },
    });

    const response = await withAuthenticatedApiRoute(handler)(
      request,
      undefined,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(handler).toHaveBeenCalled();
  });

  it("should create app router resolver context from request headers", () => {
    const request = new Request("http://localhost/api/graphql", {
      headers: {
        authorization: "Bearer test-token",
        "x-request-id": "request-id-1",
      },
    });

    const context = createAppRouterResolverContextType(request);

    expect(context).toEqual({
      pid: "12345abced",
      accessToken: "test-token",
      xRequestId: "request-id-1",
    });
  });
});
