import Alert from '../../../Alert/Alert';
import { SykmeldingFragment } from '../../../../../graphql/queries/react-query.generated';
import { notNull } from '../../../../../utils/tsUtils';

import PeriodSummaryTable from './PeriodSummaryTable';

function PeriodSummary({
    sykmeldinger,
    className,
}: {
    sykmeldinger: (SykmeldingFragment | null)[];
    className?: string;
}): JSX.Element {
    const failedCount = sykmeldinger.filter((it) => !notNull(it)).length;
    return (
        <div className={className}>
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
