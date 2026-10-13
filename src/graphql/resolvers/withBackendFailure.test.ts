import { describe, expect, it } from "vitest";
import { isServerLogged } from "./withBackendFailure";

describe("isServerLogged", () => {
  it("recognises a logged GraphQL error without relying on its class", () => {
    expect(isServerLogged({ extensions: { serverLogged: true } })).toBe(true);
  });

  it("recognises a logged error inside a GraphQL errors array", () => {
    expect(
      isServerLogged({
        graphQLErrors: [{ extensions: { serverLogged: true } }],
      }),
    ).toBe(true);
  });

  it.each([
    ["a plain Error", new Error("x")],
    ["null", null],
    ["undefined", undefined],
    ["a string", "x"],
    ["a string-valued marker", { extensions: { serverLogged: "true" } }],
    ["invalid GraphQL entries", { graphQLErrors: [null, {}] }],
    ["a non-array graphQLErrors", { graphQLErrors: {} }],
  ])("does not treat %s as already logged", (_description, error) => {
    expect(isServerLogged(error)).toBe(false);
  });
});
