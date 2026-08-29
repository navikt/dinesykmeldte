import { ApolloError } from "@apollo/client";
import { logger } from "@navikt/next-logger";
import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";
import {
  markApolloErrorAsHandled,
  reportClientErrorUnlessHandledByApollo,
  wasApolloErrorHandled,
} from "./apolloErrorOwnership";

describe("Apollo error ownership", () => {
  it("recognizes a centrally handled error after Apollo wraps it", () => {
    const cause = new GraphQLError("backend detail");
    markApolloErrorAsHandled(cause);
    const wrapped = new ApolloError({ graphQLErrors: [cause] });
    const loggerSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);

    expect(wasApolloErrorHandled(wrapped)).toBe(true);
    reportClientErrorUnlessHandledByApollo(wrapped, "mutation failed");

    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it("reports an unhandled local error exactly once", () => {
    const error = new Error("cache update failed");
    const loggerSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);

    reportClientErrorUnlessHandledByApollo(error, "mutation failed");

    expect(loggerSpy).toHaveBeenCalledOnce();
    expect(loggerSpy).toHaveBeenCalledWith(error, "mutation failed");
  });
});
