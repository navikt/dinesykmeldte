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
    vi.clearAllMocks();
    usePathname.mockReturnValue(
      "/arbeidsgiver/sykmeldte/sykmeldt/11111111-1111-4111-8111-111111111111/sykmeldinger",
    );
  });

  it("gir SDK-hooken rå pathname slik at like rutemaler ikke dedupliseres", () => {
    const { rerender } = render(<ApmRouteTracker />);

    usePathname.mockReturnValue(
      "/arbeidsgiver/sykmeldte/sykmeldt/22222222-2222-4222-8222-222222222222/sykmeldinger",
    );
    rerender(<ApmRouteTracker />);

    usePathname.mockReturnValue(
      "/arbeidsgiver/sykmeldte/sykmeldt/33333333-3333-4333-8333-333333333333/sykmeldinger",
    );
    rerender(<ApmRouteTracker />);

    expect(useApmRouteTracking).toHaveBeenNthCalledWith(
      1,
      "/arbeidsgiver/sykmeldte/sykmeldt/11111111-1111-4111-8111-111111111111/sykmeldinger",
    );
    expect(useApmRouteTracking).toHaveBeenNthCalledWith(
      2,
      "/arbeidsgiver/sykmeldte/sykmeldt/22222222-2222-4222-8222-222222222222/sykmeldinger",
    );
    expect(useApmRouteTracking).toHaveBeenNthCalledWith(
      3,
      "/arbeidsgiver/sykmeldte/sykmeldt/33333333-3333-4333-8333-333333333333/sykmeldinger",
    );
  });
});
