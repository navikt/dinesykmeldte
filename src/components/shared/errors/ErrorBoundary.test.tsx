import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

const { sendClientErrorToBackend } = vi.hoisted(() => ({
  sendClientErrorToBackend: vi.fn(),
}));

vi.mock("../../../observability/clientErrorLogger", () => ({
  sendClientErrorToBackend,
}));
vi.mock("./PageError", () => ({
  default: () => <div>Kontrollert fallback</div>,
}));

function ThrowingChild(): never {
  throw new Error("syntetisk renderfeil");
}

describe("ErrorBoundary", () => {
  it("viser fallback og sender renderfeilen én gang til backendloggen", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Kontrollert fallback")).toBeInTheDocument();
    expect(sendClientErrorToBackend).toHaveBeenCalledOnce();
    expect(sendClientErrorToBackend).toHaveBeenCalledWith(
      expect.objectContaining({ message: "syntetisk renderfeil" }),
      "Unhandled render error",
      expect.objectContaining({
        componentStack: expect.stringContaining("ThrowingChild"),
      }),
    );
  });
});
