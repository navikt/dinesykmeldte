import { lazyNextleton } from "nextleton";
import { FakeMockDB } from "./mockDb";

const mockDb = lazyNextleton("mockDb", () => new FakeMockDB());

/**
 * Used ONLY by tests to reset the fake DB to initial values between tests
 */
export function resetMockDb(): void {
  if (process.env.NODE_ENV !== "test")
    throw new Error("This is a test only utility");

  mockDb.reset();
}

export default mockDb;
