import { beforeEach, expect, it, vi } from "vitest";
import { failureDiagnostics, logServerFailure } from "./serverLog";

const lines = vi.hoisted((): string[] => []);
vi.mock("@navikt/next-logger", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@navikt/next-logger")>();
  return {
    ...actual,
    logger: actual.backendLogger(
      {},
      { write: (line: string) => lines.push(line) },
    ),
  };
});

beforeEach(() => {
  lines.length = 0;
});

it("does not invent a failure kind without an error or context", () => {
  expect(failureDiagnostics(undefined)).toEqual({});
});

it("recognises a TimeoutError even when its nested cause has no transport code", () => {
  const error = Object.assign(
    new Error("private-canary", { cause: new Error("private-canary") }),
    { name: "TimeoutError" },
  );
  expect(failureDiagnostics(error)).toMatchObject({
    failure_kind: "timeout",
    cause_type: "TimeoutError",
  });
  expect(failureDiagnostics(error)).not.toHaveProperty("error_code");
});

it("retains response status semantics without treating a successful status as an error by itself", () => {
  const error = Object.assign(new Error("private-canary"), {
    upstream_status: 202,
    failure_stage: "response",
  });
  expect(failureDiagnostics(error)).toMatchObject({
    failure_kind: "http",
    error_code: "UPSTREAM_UNEXPECTED_STATUS",
    upstream_status: 202,
  });
  expect(failureDiagnostics(error, "response_validation")).toMatchObject({
    failure_kind: "invalid_response",
    error_code: "UPSTREAM_RESPONSE_SCHEMA_MISMATCH",
    upstream_status: 202,
  });
  expect(
    failureDiagnostics(
      Object.assign(new Error("private-canary"), { upstream_status: 200 }),
    ),
  ).toMatchObject({ failure_kind: "unknown", upstream_status: 200 });
});

it("lets a reviewed context override inferred diagnostics in the serialized event", () => {
  logServerFailure(
    "hendelserResolveFailed",
    Object.assign(new Error("private-canary"), { code: "ENOTFOUND" }),
    { failure_kind: "configuration", error_code: "SAFE_CONFIGURATION_ERROR" },
  );
  expect(lines).toHaveLength(1);
  expect(JSON.parse(lines[0])).toMatchObject({
    failure_kind: "configuration",
    error_code: "SAFE_CONFIGURATION_ERROR",
  });
  expect(lines[0]).not.toMatch(/private-canary|logging_context_invalid/);
});
