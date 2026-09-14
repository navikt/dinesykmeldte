import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { utledAktueltNa } from "../utils/oppfolging";
import { PrototypeProvider, usePrototype } from "./PrototypeContext";

const renderState = () =>
  renderHook(() => usePrototype(), { wrapper: PrototypeProvider });

describe("felles prototypetilstand", () => {
  it("beholder hver ansatts avtale på tvers av valg og konsepter", () => {
    const { result } = renderState();
    const opprinneligEmil = result.current.avtaleFor("emil");
    act(() => result.current.settAvtale("ada", "2026-10-07"));
    act(() => result.current.setFokusAnsattId("emil"));
    act(() => result.current.setVariant("A"));
    expect(result.current.avtaleFor("emil")).toBe(opprinneligEmil);
    expect(result.current.avtaleFor("ada")).toBe("2026-10-07");
    act(() => result.current.setVariant("C"));
    act(() => result.current.setFokusAnsattId("ada"));
    expect(result.current.avtaleFor(result.current.fokusAnsatt.id)).toBe(
      "2026-10-07",
    );
  });

  it("nullstiller øktendringer ved scenariobytte, også avtaler", () => {
    const { result } = renderState();
    act(() => result.current.settAvtale("ada", "2026-10-07"));
    act(() => result.current.setScenarioId("gradert"));
    expect(result.current.fokusAnsatt.id).toBe("emil");
    expect(result.current.avtaleFor("ada")).toBeNull();
    expect(result.current.antallEndringer).toBe(0);
    expect(result.current.avtaleFor("emil")).toBe(
      result.current.fokusAnsatt.oppfolgingsplan.evalueresDato,
    );
  });

  it("viser fokuspersonen i et utvalg på én, og holder 6/25 ansatte tilgjengelige", () => {
    const { result } = renderState();
    act(() => result.current.setEmployeeCount(1));
    act(() => result.current.setScenarioId("mot-slutten"));
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

  it("lagrer et møtebehovssvar per ansatt og oppdaterer oppgaven", () => {
    const { result } = renderState();
    act(() => result.current.setEmployeeCount(25));
    act(() => result.current.setFokusAnsattId("ansatt-10"));
    expect(
      utledAktueltNa(
        result.current.fokusAnsatt,
        result.current.dm1For("ansatt-10"),
      ).handling.id,
    ).toBe("svar-motebehov");
    act(() => result.current.settMotebehov("ansatt-10", "ja"));
    expect(result.current.motebehovFor("ansatt-10")).toBe("ja");
    expect(result.current.motebehovFor("jonas")).toBeNull();
    expect(result.current.fokusAnsatt.motebehov?.besvart).toBe(true);
    expect(
      utledAktueltNa(
        result.current.fokusAnsatt,
        result.current.dm1For("ansatt-10"),
      ).kategori,
    ).toBe("avventer");
    act(() => result.current.nullstill());
    expect(result.current.motebehovFor("ansatt-10")).toBeNull();
    expect(
      result.current.allAnsatte.find((ansatt) => ansatt.id === "ansatt-10")
        ?.motebehov?.besvart,
    ).toBe(false);
  });
});
