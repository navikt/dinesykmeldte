import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { utledAktueltNa, utledTidslinje } from "../utils/oppfolging";
import { PrototypeProvider, usePrototype } from "./PrototypeContext";

const renderState = () =>
  renderHook(() => usePrototype(), { wrapper: PrototypeProvider });

describe("lokal påminnelsestilstand", () => {
  it("holder ansattes visningsvalg adskilt på tvers av ansatte og konsepter", () => {
    const { result } = renderState();
    act(() => result.current.settDm1("ada", { type: "skjult" }));
    act(() => result.current.setFokusAnsattId("emil"));
    act(() => result.current.setVariant("A"));
    expect(result.current.dm1For("emil")).toEqual({ type: "synlig" });
    expect(result.current.dm1For("ada")).toEqual({ type: "skjult" });
    act(() => result.current.setVariant("C"));
    act(() => result.current.setFokusAnsattId("ada"));
    expect(result.current.dm1For(result.current.fokusAnsatt.id)).toEqual({
      type: "skjult",
    });
    expect(
      utledTidslinje(
        result.current.fokusAnsatt,
        result.current.dm1For("ada"),
      ).find((event) => event.id === "dm1")?.status,
    ).toBe("ukjent");
  });

  it("nullstiller visningsvalg uten å opprette møtestatus eller avtaler", () => {
    const { result } = renderState();
    act(() => result.current.settDm1("ada", { type: "skjult" }));
    act(() => result.current.settDm1("noor", { type: "synlig" }));
    act(() => result.current.setFokusAnsattId("noor"));
    expect(result.current.antallEndringer).toBe(2);
    act(() => result.current.nullstill());
    expect(result.current.fokusAnsatt.id).toBe("ada");
    expect(result.current.dm1For("ada")).toEqual({ type: "synlig" });
    expect(result.current.dm1For("noor")).toEqual({ type: "skjult" });
    expect(result.current.antallEndringer).toBe(0);
  });

  it("husker ikke valgene etter at demoøkten er avsluttet", () => {
    const first = renderState();
    act(() => first.result.current.settDm1("ada", { type: "skjult" }));
    first.unmount();
    const next = renderState();
    expect(next.result.current.dm1For("ada")).toEqual({ type: "synlig" });
    expect(next.result.current.antallEndringer).toBe(0);
  });

  it("viser fokuspersonen ved én ansatt og holder fokus gyldig ved 6/25", () => {
    const { result } = renderState();
    act(() => result.current.setFokusAnsattId("liv"));
    act(() => result.current.setEmployeeCount(1));
    expect(result.current.ansatte.map((ansatt) => ansatt.id)).toEqual(["liv"]);
    act(() => result.current.setEmployeeCount(25));
    expect(result.current.ansatte).toHaveLength(25);
    act(() => result.current.setFokusAnsattId("ansatt-25"));
    act(() => result.current.setEmployeeCount(6));
    expect(result.current.ansatte).toHaveLength(6);
    expect(
      result.current.ansatte.some(
        (ansatt) => ansatt.id === result.current.fokusAnsatt.id,
      ),
    ).toBe(true);
  });

  it("et møtebehovssvar i en støttedialog endrer ikke påminnelsen om DM1", () => {
    const { result } = renderState();
    act(() => result.current.settMotebehov("ada", "ja"));
    expect(result.current.motebehovFor("ada")).toBe("ja");
    expect(result.current.motebehovFor("emil")).toBeNull();
    expect(
      utledAktueltNa(result.current.fokusAnsatt, result.current.dm1For("ada"))
        .hendelseId,
    ).toBe("dm1");
    act(() => result.current.nullstill());
    expect(result.current.motebehovFor("ada")).toBeNull();
  });
});
