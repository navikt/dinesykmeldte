import { Accordion } from '@navikt/ds-react'

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated'
import { notNull } from '../../../../utils/tsUtils'
import { periodByDateAsc } from '../../../../utils/sykmeldingPeriodUtils'
import { logAmplitudeEvent } from '../../../../amplitude/amplitude'
import { cn } from '../../../../utils/tw-utils'

import SummaryHeaderContent from './PeriodSummary/SummaryHeaderContent'
import styles from './ExpandableSykmeldtPeriodSummary.module.css'
import PeriodSummaryTable from './PeriodSummary/PeriodSummaryTable'

interface Props {
    expanded: boolean
    onClick: (id: string, where: 'periods') => void
    previewSykmeldt: PreviewSykmeldtFragment
}

function ExpandableSykmeldtPeriodSummary({ expanded, onClick, previewSykmeldt }: Props): JSX.Element {
    return (
        <Accordion className="mb-4 rounded border border-border-default bg-white">
            <Accordion.Item open={expanded}>
                <Accordion.Header
                    id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
                    className={cn([styles.accordionHeader], 'border-none [&>span]:flex-grow')}
                    onClick={() => {
                        logAmplitudeEvent({
                            eventName: expanded ? 'accordion lukket' : 'accordion åpnet',
                            data: { tekst: 'Sykmeldingshistorikk' },
                        })
                        onClick(previewSykmeldt.narmestelederId, 'periods')
                    }}
                >
                    <SummaryHeaderContent name={previewSykmeldt.navn} expanded={expanded} />
                </Accordion.Header>
                <Accordion.Content className="overflow-y-auto border-none p-4 pt-0">
                    <PeriodSummaryTable
                        perioder={previewSykmeldt.sykmeldinger
                            ?.flatMap((it) => it?.perioder)
                            .filter(notNull)
                            .sort(periodByDateAsc)}
                    />
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    )
}

export default ExpandableSykmeldtPeriodSummary
