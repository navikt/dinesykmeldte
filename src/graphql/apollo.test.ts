import { ApolloLink, execute, gql, Observable } from "@apollo/client";
import { logger } from "@navikt/next-logger";
import { GraphQLError } from "graphql";
import { afterEach, describe, expect, it, vi } from "vitest";
import { errorLink } from "./apollo";

describe("errorLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a warning for a forbidden response", async () => {
    const loggerWarnSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => undefined);
    const forbiddenLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error({ statusCode: 403 });
        }),
    );

    await new Promise<void>((resolve) => {
      execute(errorLink.concat(forbiddenLink), {
        query: gql`
          query TestQuery {
            __typename
          }
        `,
      }).subscribe({ error: () => resolve() });
    });

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      { event: "graphql_request_forbidden", status: 403 },
      "GraphQL request was forbidden",
    );
  });

  it("logs GraphQL errors without their raw message", async () => {
    const loggerErrorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);
    const graphQLErrorLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({
            errors: [
              new GraphQLError("sensitive backend detail", {
                path: ["mineSykmeldte"],
              }),
            ],
          });
          observer.complete();
        }),
    );

    await new Promise<void>((resolve) => {
      execute(errorLink.concat(graphQLErrorLink), {
        query: gql`
          query MineSykmeldte {
            mineSykmeldte {
              narmestelederId
            }
          }
        `,
      }).subscribe({ complete: resolve });
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      {
        event: "graphql_request_failed",
        category: "graphql",
        operation: "MineSykmeldte",
        path: ["mineSykmeldte"],
        locations: undefined,
      },
      "GraphQL request returned an error",
    );
    expect(JSON.stringify(loggerErrorSpy.mock.calls)).not.toContain(
      "sensitive backend detail",
    );
  });
});
