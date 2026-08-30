import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

vi.mock("./PageError", () => ({
  default: () => <div>Kontrollert fallback</div>,
}));

function ThrowingChild(): never {
  throw new Error("syntetisk renderfeil");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("viser en kontrollert fallback ved renderfeil", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Kontrollert fallback")).toBeInTheDocument();
  });
});
