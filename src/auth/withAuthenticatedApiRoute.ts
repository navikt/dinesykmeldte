import { logger } from "@navikt/next-logger";
import { getToken, parseIdportenToken, validateToken } from "@navikt/oasis";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ResolverContextType } from "../graphql/resolvers/resolverTypes";
import { logServerFailure } from "../observability/serverLog";
import { browserEnv, isLocalOrDemo } from "../utils/env";
import { AUTH_HEADERS } from "./constants";

type AppRouteHandler<C = unknown> = (
  req: Request,
  context: C,
) => Promise<Response> | Response;

export function withAuthenticatedApiRoute<C = unknown>(
  handler: AppRouteHandler<C>,
): AppRouteHandler<C> {
  return async function withBearerTokenHandler(req, context) {
    if (isLocalOrDemo) {
      logger.info(
        "Is running locally or in demo, skipping authentication for API",
      );
      return handler(req, context);
    }

    const token = getToken(req);
    if (token == null) {
      return Response.json({ message: "Access denied" }, { status: 401 });
    }

    const validationResult = await validateToken(token);
    if (!validationResult.ok) {
      const expired = validationResult.errorType === "token expired";
      logServerFailure(
        expired ? "jwtExpired" : "jwtValidationFailed",
        validationResult.error,
        {
          failure_stage: "authentication",
          error_code: expired
            ? "IDPORTEN_TOKEN_EXPIRED"
            : "IDPORTEN_TOKEN_VALIDATION_ERROR",
          ...(expired ? { failure_kind: "token", outcome: "rejected" } : {}),
        },
      );

      return Response.json({ message: "Access denied" }, { status: 401 });
    }

    return handler(req, context);
  };
}

export function createAppRouterResolverContextType(
  req: Request,
): ResolverContextType | null {
  if (isLocalOrDemo) {
    return require("./fakeLocalAuthTokenSet.json");
  }

  const token = getToken(req);
  if (!token) {
    return null;
  }

  const payload = parseIdportenToken(token);
  const xRequestId = req.headers.get("x-request-id") ?? undefined;

  if (!payload.ok) {
    logServerFailure("jwtParseFailed", payload.error, {
      failure_stage: "authentication",
      error_code: "IDPORTEN_TOKEN_PARSE_ERROR",
    });
    return null;
  }

  return {
    pid: payload.pid,
    accessToken: token,
    xRequestId: xRequestId,
  };
}

export async function verifyUserLoggedIn(): Promise<string> {
  if (isLocalOrDemo) {
    logger.info("Running locally or in demo, skipping authentication");
    return "fake-local-token";
  }

  const requestHeaders = await headers();
  const requestedPath =
    requestHeaders.get(AUTH_HEADERS.REQUESTED_PATH_HEADER) ??
    browserEnv.publicPath ??
    "/";

  if (requestedPath?.startsWith("/oauth2")) {
    return "";
  }

  const token = getToken(requestHeaders);
  if (!token) {
    logger.info("Found no token, redirecting to login");
    redirectToLogin(requestedPath ?? "/");
  }

  const validationResult = await validateToken(token);
  if (!validationResult.ok) {
    logger.info(
      `Invalid JWT token found (${validationResult.errorType}), redirecting to login`,
    );
    redirectToLogin(requestedPath ?? "/");
  }

  return token;
}

function redirectToLogin(path: string): never {
  redirect(`/oauth2/login?redirect=${encodeURIComponent(path)}`);
}
