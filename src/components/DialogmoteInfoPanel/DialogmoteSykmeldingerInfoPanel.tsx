import React, { ReactElement, useEffect } from 'react'
import { Link } from '@navikt/ds-react'

import { VeilederBorder } from '../shared/veileder/Veileder'
import { browserEnv } from '../../utils/env'
import { logAmplitudeEvent } from '../../amplitude/amplitude'
import { useSykmeldt } from '../../hooks/useSykmeldt'
import { hasBeenSykmeldt6WeeksWithout16DaysOpphold } from '../../utils/sykmeldtUtils'

interface Props {
    sykmeldtId: string
    name: string
}

function DialogmoteSykmeldingerInfoPanel({ sykmeldtId, name }: Props): ReactElement | null {
    const { sykmeldt } = useSykmeldt()
    const hasDismissed = localStorage.getItem('dialogmote-sykmeldinger-info') ?? 'false'
    const shouldShow = hasDismissed !== 'true'
    const hasBeenSykmeldt6Weeks: boolean = (sykmeldt && hasBeenSykmeldt6WeeksWithout16DaysOpphold(sykmeldt)) ?? false

    useEffect(() => {
        if (!shouldShow || !hasBeenSykmeldt6Weeks) return

        logAmplitudeEvent({
            eventName: 'guidepanel vist',
            data: { tekst: 'Har dere behov for et dialogmøte?', komponent: 'DialogmoteSykmeldingerInfoPanel' },
        })
    }, [hasBeenSykmeldt6Weeks, shouldShow])

    if (!shouldShow || !hasBeenSykmeldt6Weeks) return null

    return (
        <VeilederBorder title="Har dere behov for et dialogmøte?">
            Du kan{' '}
            <Link
                href={`${
                    browserEnv.publicPath ?? ''
                }/dialogmoter/${sykmeldtId}?source=dialogmote-sykmeldinger-veileder`}
                onClick={() => {
                    localStorage.setItem('dialogmote-sykmeldinger-info', 'true')
                }}
            >
                be om et dialogmøte med {name.split(' ')[0]} og NAV
            </Link>{' '}
            hvis dere har behov for det.
        </VeilederBorder>
    )
}

export default DialogmoteSykmeldingerInfoPanel
