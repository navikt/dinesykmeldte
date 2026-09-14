"use client";

import { formatISO } from "date-fns";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ALLE_ANSATTE,
  ANSATTE,
  SCENARIER,
  STANDARD_SCENARIO,
} from "../data/scenarier";
import type { Ansatt, Dm1Status, Scenario, VariantId } from "../types";

export type EmployeeCount = 1 | 6 | 25;
export type MotebehovSvar = "ja" | "nei" | "usikker";

/** Opplysninger knyttes til hver ansatt. Et scenariobytte nullstiller demonstrasjonen. */
interface PrototypeState {
  variant: VariantId;
  setVariant: (variant: VariantId) => void;
  scenario: Scenario;
  setScenarioId: (id: string) => void;
  fokusAnsatt: Ansatt;
  setFokusAnsattId: (id: string) => void;
  employeeCount: EmployeeCount;
  setEmployeeCount: (count: EmployeeCount) => void;
  allAnsatte: Ansatt[];
  ansatte: Ansatt[];
  dm1For: (ansattId: string) => Dm1Status;
  settDm1: (ansattId: string, status: Dm1Status) => void;
  avtaleFor: (ansattId: string) => string | null;
  settAvtale: (ansattId: string, dato: string | null) => void;
  motebehovFor: (ansattId: string) => MotebehovSvar | null;
  settMotebehov: (ansattId: string, svar: MotebehovSvar) => void;
  antallEndringer: number;
  nullstill: () => void;
}

const Context = createContext<PrototypeState | null>(null);
const finnScenario = (id: string): Scenario =>
  SCENARIER.find((s) => s.id === id) ?? SCENARIER[0];

function startStatuser(scenario: Scenario): Record<string, Dm1Status> {
  const statuser = Object.fromEntries(
    ALLE_ANSATTE.map((ansatt) => [ansatt.id, ansatt.dm1Start]),
  );
  if (scenario.dm1Override)
    statuser[scenario.fokusAnsattId] = scenario.dm1Override;
  return statuser;
}

function startAvtaler(): Record<string, string | null> {
  return Object.fromEntries(
    ALLE_ANSATTE.map((ansatt) => [
      ansatt.id,
      ansatt.oppfolgingsplan.evalueresDato ?? null,
    ]),
  );
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<VariantId>("B");
  const [scenarioId, setScenarioIdState] = useState(STANDARD_SCENARIO);
  const [fokusAnsattId, setFokusAnsattId] = useState(
    finnScenario(STANDARD_SCENARIO).fokusAnsattId,
  );
  const [employeeCount, setEmployeeCountState] = useState<EmployeeCount>(6);
  const [dm1Statuser, setDm1Statuser] = useState(() =>
    startStatuser(finnScenario(STANDARD_SCENARIO)),
  );
  const [avtaler, setAvtaler] = useState(startAvtaler);
  const [motebehovSvar, setMotebehovSvar] = useState<
    Record<string, { svar: MotebehovSvar; dato: string }>
  >({});
  const [antallEndringer, setAntallEndringer] = useState(0);
  const scenario = finnScenario(scenarioId);

  const setScenarioId = useCallback((id: string) => {
    const nytt = finnScenario(id);
    setScenarioIdState(nytt.id);
    setFokusAnsattId(nytt.fokusAnsattId);
    setDm1Statuser(startStatuser(nytt));
    setAvtaler(startAvtaler());
    setMotebehovSvar({});
    setAntallEndringer(0);
  }, []);

  const setEmployeeCount = useCallback(
    (count: EmployeeCount) => {
      setEmployeeCountState(count);
      if (
        count === 6 &&
        !ANSATTE.some((ansatt) => ansatt.id === fokusAnsattId)
      ) {
        setFokusAnsattId(scenario.fokusAnsattId);
      }
    },
    [fokusAnsattId, scenario.fokusAnsattId],
  );

  const dm1For = useCallback(
    (ansattId: string): Dm1Status =>
      dm1Statuser[ansattId] ?? { type: "ukjent" },
    [dm1Statuser],
  );
  const settDm1 = useCallback((ansattId: string, status: Dm1Status) => {
    setDm1Statuser((forrige) => ({ ...forrige, [ansattId]: status }));
    setAntallEndringer((n) => n + 1);
  }, []);
  const avtaleFor = useCallback(
    (ansattId: string): string | null => avtaler[ansattId] ?? null,
    [avtaler],
  );
  const settAvtale = useCallback((ansattId: string, dato: string | null) => {
    setAvtaler((forrige) => ({ ...forrige, [ansattId]: dato }));
    setAntallEndringer((n) => n + 1);
  }, []);
  const motebehovFor = useCallback(
    (ansattId: string): MotebehovSvar | null =>
      motebehovSvar[ansattId]?.svar ?? null,
    [motebehovSvar],
  );
  const settMotebehov = useCallback((ansattId: string, svar: MotebehovSvar) => {
    setMotebehovSvar((forrige) => ({
      ...forrige,
      [ansattId]: {
        svar,
        dato: formatISO(new Date(), { representation: "date" }),
      },
    }));
    setAntallEndringer((n) => n + 1);
  }, []);

  const nullstill = useCallback(() => {
    setDm1Statuser(startStatuser(scenario));
    setAvtaler(startAvtaler());
    setMotebehovSvar({});
    setFokusAnsattId(scenario.fokusAnsattId);
    setAntallEndringer(0);
  }, [scenario]);

  const allAnsatte = useMemo(
    () =>
      ALLE_ANSATTE.map((ansatt) => {
        const oppgittSvar = motebehovSvar[ansatt.id];
        return oppgittSvar
          ? {
              ...ansatt,
              motebehov: {
                ...ansatt.motebehov,
                innkallingDato: ansatt.motebehov?.innkallingDato ?? null,
                besvart: true,
                besvartDato: oppgittSvar.dato,
              },
            }
          : ansatt;
      }),
    [motebehovSvar],
  );
  const fokusAnsatt =
    allAnsatte.find((a) => a.id === fokusAnsattId) ?? allAnsatte[0];
  const ansatte = useMemo(
    () =>
      employeeCount === 1
        ? [fokusAnsatt]
        : employeeCount === 6
          ? allAnsatte.slice(0, 6)
          : allAnsatte,
    [employeeCount, fokusAnsatt, allAnsatte],
  );
  const value = useMemo(
    (): PrototypeState => ({
      variant,
      setVariant,
      scenario,
      setScenarioId,
      fokusAnsatt,
      setFokusAnsattId,
      employeeCount,
      setEmployeeCount,
      allAnsatte,
      ansatte,
      dm1For,
      settDm1,
      avtaleFor,
      settAvtale,
      motebehovFor,
      settMotebehov,
      antallEndringer,
      nullstill,
    }),
    [
      variant,
      scenario,
      setScenarioId,
      fokusAnsatt,
      employeeCount,
      setEmployeeCount,
      allAnsatte,
      ansatte,
      dm1For,
      settDm1,
      avtaleFor,
      settAvtale,
      motebehovFor,
      settMotebehov,
      antallEndringer,
      nullstill,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePrototype(): PrototypeState {
  const context = useContext(Context);
  if (!context)
    throw new Error("usePrototype må brukes inne i PrototypeProvider");
  return context;
}
