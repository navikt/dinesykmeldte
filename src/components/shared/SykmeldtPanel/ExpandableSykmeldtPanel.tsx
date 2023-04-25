import { BodyShort, ExpansionCard } from '@navikt/ds-react'
import React, { useEffect, useRef, CSSProperties } from 'react'
import * as R from 'remeda'

import { PreviewSoknadFragment, PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import { previewNySoknaderRead } from '../../../utils/soknadUtils'
import { logAmplitudeEvent } from '../../../amplitude/amplitude'

import ExpandableSykmeldtPeriodSummary from './ExpandableSykmeldtPeriodSummary/ExpandableSykmeldtPeriodSummary'
import SykmeldtSummary from './SykmeldtSummary/SykmeldtSummary'
import SykmeldtContent from './SykmeldtContent/SykmeldtContent'
import SykmeldtInfo from './SykmeldtInfo/SykmeldtInfo'
import { ManglerSoknadInfo } from './ManglerSoknadInfo/ManglerSoknadInfo'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
    expanded: boolean
    periodsExpanded: boolean
    onClick: (id: string, where: 'root' | 'periods') => void
    notification: boolean
    focusSykmeldtId: string | null
    notifyingText?: string
}

function ExpandableSykmeldtPanel({
    sykmeldt,
    expanded,
    periodsExpanded,
    onClick,
    notification,
    focusSykmeldtId,
    notifyingText,
}: Props): JSX.Element {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (focusSykmeldtId !== sykmeldt.narmestelederId) return

        ref.current?.focus()
        ref.current?.scrollIntoView({ behavior: 'smooth' })
    }, [focusSykmeldtId, sykmeldt.narmestelederId])

    const nySoknaderReadWithWarning: PreviewSoknadFragment[] = previewNySoknaderRead(sykmeldt.previewSoknader)
    const notSentSoknaderWarning = !notification && nySoknaderReadWithWarning.length > 0

    const headerId = `sykmeldt-accordion-header-${sykmeldt.narmestelederId}`
    return (
        <ExpansionCard
            ref={ref}
            open={expanded}
            aria-labelledby={headerId}
            style={styleCn(
                [{ '--ac-expansioncard-bg': 'var(--a-blue-50)' }, notSentSoknaderWarning],
                [{ '--ac-expansioncard-bg': 'var(--a-surface-warning-subtle)' }, notification],
            )}
        >
            <ExpansionCard.Header
                id={headerId}
                onClick={() => {
                    logAmplitudeEvent({
                        eventName: expanded ? 'accordion lukket' : 'accordion åpnet',
                        data: { tekst: 'Den sykmeldte' },
                    })
                    onClick(sykmeldt.narmestelederId, 'root')
                }}
            >
                <SykmeldtSummary
                    sykmeldt={sykmeldt}
                    notification={notification}
                    notSentSoknad={notSentSoknaderWarning}
                    notifyingText={notifyingText}
                />
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                {nySoknaderReadWithWarning.length > 0 && (
                    <ManglerSoknadInfo
                        name={sykmeldt.navn}
                        soknader={nySoknaderReadWithWarning}
                        sykmeldtId={sykmeldt.narmestelederId}
                    />
                )}
                <ExpandableSykmeldtPeriodSummary
                    onClick={onClick}
                    expanded={periodsExpanded}
                    previewSykmeldt={sykmeldt}
                />
                <SykmeldtInfo sykmeldt={sykmeldt} />
                <BodyShort className="mb-4" spacing size="small">
                    Av personvernhensyn vises dokumentene inntil fire måneder etter at medarbeideren har blitt frisk. Du
                    finner alle sykmeldinger i Altinn.
                </BodyShort>
                <SykmeldtContent sykmeldt={sykmeldt} notification={notification} />
            </ExpansionCard.Content>
        </ExpansionCard>
    )
}

type CssPropTuple = [Record<string, string>, boolean]
function styleCn(...props: (CssPropTuple | Record<string, string>)[]): CSSProperties {
    return R.pipe(
        props,
        R.filter((prop) => (Array.isArray(prop) ? prop[1] === true : true)),
        R.map((prop) => (Array.isArray(prop) && prop[0]) || prop),
        R.mergeAll,
    )
}

export default ExpandableSykmeldtPanel
