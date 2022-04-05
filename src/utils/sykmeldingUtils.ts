import { compareAsc } from 'date-fns';

import { SykmeldingFragment } from '../graphql/queries/graphql.generated';

import { toDate } from './dateUtils';
import { toLatestTom } from './sykmeldingPeriodUtils';

export function sykmeldingByDateAsc(a: SykmeldingFragment, b: SykmeldingFragment): number {
    const latestA = a.perioder.reduce(toLatestTom);
    const latestB = b.perioder.reduce(toLatestTom);

    return compareAsc(toDate(latestA.tom), toDate(latestB.tom));
}
