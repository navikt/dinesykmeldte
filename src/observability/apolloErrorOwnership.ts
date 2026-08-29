import { isApolloError } from "@apollo/client";
import { logger } from "@navikt/next-logger";

const handledApolloErrors = new WeakSet<object>();

const isObject = (value: unknown): value is object =>
  value !== null && typeof value === "object";

export function markApolloErrorAsHandled(error: unknown): void {
  if (isObject(error)) handledApolloErrors.add(error);
}

export function wasApolloErrorHandled(error: unknown): boolean {
  if (!isObject(error)) return false;
  if (handledApolloErrors.has(error)) return true;
  if (!(error instanceof Error) || !isApolloError(error)) return false;

  return [
    error.cause,
    error.networkError,
    ...error.graphQLErrors,
    ...error.protocolErrors,
    ...error.clientErrors,
  ].some((cause) => isObject(cause) && handledApolloErrors.has(cause));
}

export function reportClientErrorUnlessHandledByApollo(
  error: unknown,
  message: string,
): void {
  if (wasApolloErrorHandled(error)) return;

  const normalized =
    error instanceof Error ? error : new Error("Unknown client error");
  logger.error(normalized, message);
}
