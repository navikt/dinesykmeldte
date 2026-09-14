"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ANSATTE, SCENARIER, STANDARD_SCENARIO } from "../data/scenarier";
import type { Ansatt, Dm1Status, Scenario, VariantId } from "../types";

/**
 * All tilstand lever i minnet og nullstilles ved reload. Prototypen gjør ingen
 * skrivende kall, sender ingen varsler og lagrer ingenting.
 */
interface PrototypeState {
  variant: VariantId;
  setVariant: (variant: VariantId) => void;

  scenario: Scenario;
  setScenarioId: (id: string) => void;

  /** Ansatt i fokus for variant A og B. Variant C kan overstyre ved klikk. */
  fokusAnsatt: Ansatt;
  setFokusAnsattId: (id: string) => void;

  ansatte: Ansatt[];
  dm1For: (ansattId: string) => Dm1Status;
  settDm1: (ansattId: string, status: Dm1Status) => void;

  /** Antall endringer leder har gjort i denne økten. */
  antallEndringer: number;
  nullstill: () => void;
}

const Context = createContext<PrototypeState | null>(null);

const finnScenario = (id: string): Scenario =>
  SCENARIER.find((s) => s.id === id) ?? SCENARIER[0];

/** Startstatus per ansatt, med scenarioets overstyring lagt på toppen. */
function startStatuser(scenario: Scenario): Record<string, Dm1Status> {
  const statuser: Record<string, Dm1Status> = {};
  for (const ansatt of ANSATTE) {
    statuser[ansatt.id] = ansatt.dm1Start;
  }
  if (scenario.dm1Override) {
    statuser[scenario.fokusAnsattId] = scenario.dm1Override;
  }
  return statuser;
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<VariantId>("B");
  const [scenarioId, setScenarioIdState] = useState<string>(STANDARD_SCENARIO);
  const [fokusAnsattId, setFokusAnsattId] = useState<string>(
    finnScenario(STANDARD_SCENARIO).fokusAnsattId,
  );
  const [dm1Statuser, setDm1Statuser] = useState<Record<string, Dm1Status>>(
    () => startStatuser(finnScenario(STANDARD_SCENARIO)),
  );
  const [antallEndringer, setAntallEndringer] = useState(0);

  const scenario = finnScenario(scenarioId);

  /**
   * Scenariobytte setter ny utgangstilstand. Variantbytte gjør det ikke, slik at
   * A, B og C kan sammenliknes på nøyaktig samme situasjon.
   */
  const setScenarioId = useCallback((id: string) => {
    const nytt = finnScenario(id);
    setScenarioIdState(id);
    setFokusAnsattId(nytt.fokusAnsattId);
    setDm1Statuser(startStatuser(nytt));
    setAntallEndringer(0);
  }, []);

  const dm1For = useCallback(
    (ansattId: string): Dm1Status =>
      dm1Statuser[ansattId] ?? { type: "ukjent" },
    [dm1Statuser],
  );

  const settDm1 = useCallback((ansattId: string, status: Dm1Status) => {
    setDm1Statuser((forrige) => ({ ...forrige, [ansattId]: status }));
    setAntallEndringer((n) => n + 1);
  }, []);

  const nullstill = useCallback(() => {
    setDm1Statuser(startStatuser(scenario));
    setFokusAnsattId(scenario.fokusAnsattId);
    setAntallEndringer(0);
  }, [scenario]);

  const fokusAnsatt = ANSATTE.find((a) => a.id === fokusAnsattId) ?? ANSATTE[0];

  const value = useMemo(
    (): PrototypeState => ({
      variant,
      setVariant,
      scenario,
      setScenarioId,
      fokusAnsatt,
      setFokusAnsattId,
      ansatte: ANSATTE,
      dm1For,
      settDm1,
      antallEndringer,
      nullstill,
    }),
    [
      variant,
      scenario,
      setScenarioId,
      fokusAnsatt,
      dm1For,
      settDm1,
      antallEndringer,
      nullstill,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePrototype(): PrototypeState {
  const context = useContext(Context);
  if (!context) {
    throw new Error("usePrototype må brukes inne i PrototypeProvider");
  }
  return context;
}
