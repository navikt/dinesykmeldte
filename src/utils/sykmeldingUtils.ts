import { compareDesc } from "date-fns";
import type { SykmeldingFragment } from "../graphql/queries/graphql.generated";
import { toDate } from "./dateUtils";
import { toLatestTom } from "./sykmeldingPeriodUtils";

export function sykmeldingByDateDesc(
  a: SykmeldingFragment,
  b: SykmeldingFragment,
): number {
  const latestA = a.perioder.reduce(toLatestTom);
  const latestB = b.perioder.reduce(toLatestTom);

  return compareDesc(toDate(latestA.tom), toDate(latestB.tom));
}
