import { logger } from "@navikt/next-logger";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../utils/test/testUtils";
import ErrorBoundary from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  it("uses fallback when provided", () => {
    vi.spyOn(logger, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary fallback={null}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(
      screen.queryByText("Denne teksten vises ikke"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Noe gikk galt")).not.toBeInTheDocument();
  });
});

function ThrowingComponent(): never {
  throw new Error("Testfeil");
}
