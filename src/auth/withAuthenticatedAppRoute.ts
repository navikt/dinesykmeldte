import { logger } from "@navikt/next-logger";
import { getToken, parseIdportenToken, validateToken } from "@navikt/oasis";
import type { ResolverContextType } from "../graphql/resolvers/resolverTypes";
import { isLocalOrDemo } from "../utils/env";

type AppRouteHandler<C = unknown> = (
  req: Request,
  context: C,
) => Promise<Response> | Response;

export function withAuthenticatedAppRoute<C = unknown>(
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
      logger.error(
        `Invalid JWT token found (${validationResult.errorType}) (cause: ${validationResult.error.message}`,
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
    logger.error(`Failed to parse token: ${payload.error.message}`);
    return null;
  }

  return {
    pid: payload.pid,
    accessToken: token,
    xRequestId: xRequestId,
  };
}
