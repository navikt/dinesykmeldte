import { differenceInDays, formatISO, max, min, parseISO } from "date-fns";
import {
  SykmeldingApi,
  SykmeldingPeriodeApi,
} from "../../../../services/minesykmeldte/schema/sykmelding";

export function getEarliestFom(perioder: SykmeldingPeriodeApi[]): string {
  return formatISO(min(perioder.map((periode) => parseISO(periode.fom))));
}

export function getLatestTom(perioder: SykmeldingPeriodeApi[]): string {
  return formatISO(max(perioder.map((periode) => parseISO(periode.tom))));
}

export function erFriskmeldt(sykmeldinger: SykmeldingApi[]): boolean {
  const latestTom = getLatestTom(sykmeldinger.flatMap((it) => it.perioder));

  return differenceInDays(new Date(), parseISO(latestTom)) > 0;
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function entries<T extends Record<string, unknown>>(obj: T): Entries<T> {
  return Object.entries(obj) as unknown as Entries<T>;
}
