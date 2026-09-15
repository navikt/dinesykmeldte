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
import { ALLE_ANSATTE, ANSATTE } from "../data/scenarier";
import type { Ansatt, Dm1Status, VariantId } from "../types";

export type EmployeeCount = 1 | 6 | 25;
export type MotebehovSvar = "ja" | "nei" | "usikker";

/** Visningsvalg knyttes til hver ansatt og lever bare i denne demoøkten. */
interface PrototypeState {
  variant: VariantId;
  setVariant: (variant: VariantId) => void;
  fokusAnsatt: Ansatt;
  setFokusAnsattId: (id: string) => void;
  employeeCount: EmployeeCount;
  setEmployeeCount: (count: EmployeeCount) => void;
  allAnsatte: Ansatt[];
  ansatte: Ansatt[];
  dm1For: (ansattId: string) => Dm1Status;
  settDm1: (ansattId: string, status: Dm1Status) => void;
  motebehovFor: (ansattId: string) => MotebehovSvar | null;
  settMotebehov: (ansattId: string, svar: MotebehovSvar) => void;
  antallEndringer: number;
  nullstill: () => void;
}

const Context = createContext<PrototypeState | null>(null);
function startStatuser(): Record<string, Dm1Status> {
  return Object.fromEntries(
    ALLE_ANSATTE.map((ansatt) => [ansatt.id, { ...ansatt.dm1Start }]),
  );
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<VariantId>("B");
  const [fokusAnsattId, setFokusAnsattId] = useState(ANSATTE[0].id);
  const [employeeCount, setEmployeeCountState] = useState<EmployeeCount>(6);
  const [dm1Statuser, setDm1Statuser] = useState(startStatuser);
  const [motebehovSvar, setMotebehovSvar] = useState<
    Record<string, { svar: MotebehovSvar; dato: string }>
  >({});
  const [antallEndringer, setAntallEndringer] = useState(0);
  const setEmployeeCount = useCallback(
    (count: EmployeeCount) => {
      setEmployeeCountState(count);
      if (
        count === 6 &&
        !ANSATTE.some((ansatt) => ansatt.id === fokusAnsattId)
      ) {
        setFokusAnsattId(ANSATTE[0].id);
      }
    },
    [fokusAnsattId],
  );

  const dm1For = useCallback(
    (ansattId: string): Dm1Status =>
      dm1Statuser[ansattId] ?? { type: "synlig" },
    [dm1Statuser],
  );
  const settDm1 = useCallback((ansattId: string, status: Dm1Status) => {
    setDm1Statuser((forrige) => ({ ...forrige, [ansattId]: status }));
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
    setDm1Statuser(startStatuser());
    setMotebehovSvar({});
    setFokusAnsattId(ANSATTE[0].id);
    setAntallEndringer(0);
  }, []);

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
      fokusAnsatt,
      setFokusAnsattId,
      employeeCount,
      setEmployeeCount,
      allAnsatte,
      ansatte,
      dm1For,
      settDm1,
      motebehovFor,
      settMotebehov,
      antallEndringer,
      nullstill,
    }),
    [
      variant,
      fokusAnsatt,
      employeeCount,
      setEmployeeCount,
      allAnsatte,
      ansatte,
      dm1For,
      settDm1,
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
