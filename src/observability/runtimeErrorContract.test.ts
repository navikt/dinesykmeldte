import { describe, expect, it } from "vitest";
import {
  getRuntimeErrorOperation,
  RuntimeErrorCode,
  RuntimeErrorEvent,
  RuntimeErrorOperation,
  runtimeErrorCodesByEvent,
} from "./runtimeErrorContract";

describe("runtime error contract", () => {
  it("keeps the event, operation and error-code catalogs closed and bounded", () => {
    const events = Object.values(RuntimeErrorEvent);
    const operations = Object.values(RuntimeErrorOperation);
    const errorCodes = Object.values(RuntimeErrorCode);

    expect(new Set(events).size).toBe(events.length);
    expect(new Set(operations).size).toBe(operations.length);
    expect(new Set(errorCodes).size).toBe(errorCodes.length);
    expect(Object.keys(runtimeErrorCodesByEvent)).toHaveLength(events.length);
    expect(new Set(Object.values(runtimeErrorCodesByEvent).flat())).toEqual(
      new Set(errorCodes),
    );

    for (const event of events) {
      const operation = getRuntimeErrorOperation(event);

      expect(event).toMatch(/^[a-z][a-z0-9_.-]{0,79}$/);
      expect(operation).toMatch(/^[a-z][a-z0-9_.-]{0,79}$/);
      expect(event).toBe(`${operation}_failed`);
      expect(runtimeErrorCodesByEvent[event]).not.toHaveLength(0);
    }

    for (const errorCode of errorCodes) {
      expect(errorCode).toMatch(/^[A-Z][A-Z0-9_]{1,79}$/);
    }
  });
});
