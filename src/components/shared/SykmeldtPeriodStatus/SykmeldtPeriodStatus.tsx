import React from 'react';

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated';
import { notNull } from '../../../utils/tsUtils';
import { formatPeriodsRelative } from '../../../utils/sykmeldingPeriodUtils';

function SykmeldtPeriodStatus({ sykmeldt }: { sykmeldt: PreviewSykmeldtFragment }): JSX.Element {
    return <span>{formatPeriodsRelative(sykmeldt.navn, sykmeldt.sykmeldinger.filter(notNull)).text}</span>;
}

export default SykmeldtPeriodStatus;
