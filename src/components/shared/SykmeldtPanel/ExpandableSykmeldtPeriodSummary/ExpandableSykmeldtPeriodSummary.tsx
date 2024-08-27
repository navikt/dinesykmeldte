import { ExpansionCard } from '@navikt/ds-react'
import { ClockDashedIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated'
import { notNull } from '../../../../utils/tsUtils'
import { periodByDateAsc } from '../../../../utils/sykmeldingPeriodUtils'
import { formatFirstNamePossessive } from '../../../../utils/sykmeldtUtils'

import PeriodSummaryTable from './PeriodSummary/PeriodSummaryTable'

interface Props {
    expanded: boolean
    onClick: (id: string, where: 'periods') => void
    previewSykmeldt: PreviewSykmeldtFragment
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): ReactElement {
    return (
        <ExpansionCard
            open={expanded}
            size="small"
            className="mb-4 bg-white"
            aria-label={formatFirstNamePossessive(previewSykmeldt.navn, 'sykmeldingshistorikk')}
        >
            <ExpansionCard.Header
                id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
                onClick={() => {
                    onClick(previewSykmeldt.narmestelederId, 'periods')
                }}
            >
                <div className="flex items-center">
                    <ClockDashedIcon className="mr-2 text-2xl text-deepblue-400" role="img" aria-hidden />
                    <ExpansionCard.Title className="max-[366px]:text-base" as="h3" size="small">
                        {formatFirstNamePossessive(previewSykmeldt.navn, 'sykmeldingshistorikk')}
                    </ExpansionCard.Title>
                </div>
            </ExpansionCard.Header>
            <ExpansionCard.Content className="max-[430px]:overflow-auto max-[430px]:whitespace-nowrap">
                <PeriodSummaryTable
                    perioder={previewSykmeldt.sykmeldinger
                        ?.flatMap((it) => it?.perioder)
                        .filter(notNull)
                        .sort(periodByDateAsc)}
                />
            </ExpansionCard.Content>
        </ExpansionCard>
    )
}

export default ExpandableSykmeldtPeriodSummary
