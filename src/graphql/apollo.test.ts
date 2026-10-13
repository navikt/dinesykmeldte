import {
  ApolloClient,
  ApolloLink,
  execute,
  gql,
  InMemoryCache,
  ServerError,
} from "@apollo/client";
import { logger } from "@navikt/next-logger";
import { GraphQLError } from "graphql";
import { Observable } from "rxjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { errorLink } from "./apollo";

describe("errorLink", () => {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.empty(),
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a warning for a forbidden response", async () => {
    const loggerWarnSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => undefined);

    const { store } = await import("../state/store");
    vi.spyOn(store, "dispatch").mockImplementation((action) => action);

    const forbiddenLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(
            new ServerError("Forbidden", {
              response: new Response(null, { status: 403 }),
              bodyText: "",
            }),
          );
        }),
    );

    await new Promise<void>((resolve) => {
      execute(
        errorLink.concat(forbiddenLink),
        {
          query: gql`
          query TestQuery {
            __typename
          }
        `,
        },
        { client },
      ).subscribe({ error: () => resolve() });
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
      execute(
        errorLink.concat(graphQLErrorLink),
        {
          query: gql`
          query MineSykmeldte {
            mineSykmeldte {
              narmestelederId
            }
          }
        `,
        },
        { client },
      ).subscribe({ complete: resolve });
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      {
        event: "graphql_request_failed",
        category: "graphql",
        operation: "MineSykmeldte",
        path: ["mineSykmeldte"],
        locations: undefined,
        code: undefined,
      },
      "GraphQL request returned an error",
    );
    expect(JSON.stringify(loggerErrorSpy.mock.calls)).not.toContain(
      "sensitive backend detail",
    );
  });

  it("does not duplicate a failure already diagnosed by the server", async () => {
    const loggerErrorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);
    const failedLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({
            errors: [
              new GraphQLError("Backend request failed", {
                extensions: {
                  code: "INTERNAL_SERVER_ERROR",
                  serverLogged: true,
                },
              }),
            ],
          });
          observer.complete();
        }),
    );
    await new Promise<void>((resolve) => {
      execute(
        errorLink.concat(failedLink),
        {
          query: gql`query MineSykmeldte { mineSykmeldte { narmestelederId } }`,
        },
        { client },
      ).subscribe({ complete: resolve });
    });
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it("logs the HTTP status for network errors", async () => {
    const loggerErrorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);
    const notFoundLink = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(
            new ServerError("Not found", {
              response: new Response(null, { status: 404 }),
              bodyText: "",
            }),
          );
        }),
    );

    await new Promise<void>((resolve) => {
      execute(
        errorLink.concat(notFoundLink),
        {
          query: gql`
          query MineSykmeldte {
            mineSykmeldte {
              narmestelederId
            }
          }
        `,
        },
        { client },
      ).subscribe({ error: () => resolve() });
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      {
        event: "graphql_network_request_failed",
        category: "graphql",
        operation: "MineSykmeldte",
        status: 404,
      },
      "GraphQL network request failed",
    );
  });
});
