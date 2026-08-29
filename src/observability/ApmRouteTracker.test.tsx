import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApmRouteTracker } from "./ApmRouteTracker";

const { useApmRouteTracking, usePathname } = vi.hoisted(() => ({
  useApmRouteTracking: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@nais/apm/react", () => ({ useApmRouteTracking }));
vi.mock("next/navigation", () => ({ usePathname }));

describe("ApmRouteTracker", () => {
  beforeEach(() => {
    usePathname.mockReturnValue(
      "/arbeidsgiver/sykmeldte/sykmeldt/11111111-1111-4111-8111-111111111111/sykmeldinger",
    );
  });

  it("sender bare normalisert path uten søkeparametre", () => {
    render(<ApmRouteTracker />);

    expect(useApmRouteTracking).toHaveBeenCalledOnce();
    expect(useApmRouteTracking).toHaveBeenCalledWith(
      "/arbeidsgiver/sykmeldte/sykmeldt/{sykmeldtId}/sykmeldinger",
    );
  });
});
