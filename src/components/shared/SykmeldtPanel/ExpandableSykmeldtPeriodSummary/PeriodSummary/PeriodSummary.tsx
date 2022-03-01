import { BodyShort } from '@navikt/ds-react';

import Alert from '../../../Alert/Alert';
import { SykmeldingFragment } from '../../../../../graphql/queries/graphql.generated';
import { notNull } from '../../../../../utils/tsUtils';

import PeriodSummaryTable from './PeriodSummaryTable';

function PeriodSummary({ sykmeldinger }: { sykmeldinger: (SykmeldingFragment | null)[] }): JSX.Element {
    const failedCount = sykmeldinger.filter((it) => !notNull(it)).length;
    return (
        <div>
            <BodyShort>Oversikten viser sykmeldingsperioder for inntil 4 måneder tilbake i tid.</BodyShort>
            {failedCount > 0 && (
                <Alert variant="error" id={`sykmelding-summary-error-${sykmeldinger[0]?.id}`}>
                    Klarte ikke å hente {failedCount} av {sykmeldinger?.length} sykmeldinger
                </Alert>
            )}
            <PeriodSummaryTable perioder={sykmeldinger?.flatMap((it) => it?.perioder).filter(notNull)} />
        </div>
    );
}

export default PeriodSummary;
