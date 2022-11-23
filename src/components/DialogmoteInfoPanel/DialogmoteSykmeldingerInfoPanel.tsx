import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from '@navikt/ds-react'

import { RootState } from '../../state/store'
import Veileder from '../shared/veileder/Veileder'
import { getPublicEnv } from '../../utils/env'
import { logAmplitudeEvent } from '../../amplitude/amplitude'
import { useSykmeldt } from '../../hooks/useSykmeldt'
import { hasBeenSykmeldt6WeeksWithout16DaysOpphold } from '../../utils/sykmeldtUtils'

const publicEnv = getPublicEnv()

interface Props {
    sykmeldtId: string
    name: string
}

function DialogmoteSykmeldingerInfoPanel({ sykmeldtId, name }: Props): JSX.Element | null {
    const { sykmeldt } = useSykmeldt()
    const dialogmoteFeature = useSelector((state: RootState) => state.metadata.dialogmoteFeature)
    const hasDismissed = localStorage.getItem('dialogmote-sykmeldinger-info') ?? 'false'
    const shouldShow = dialogmoteFeature === 'sykmeldinger' && hasDismissed !== 'true'
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
        <Veileder title="Har dere behov for et dialogmøte?">
            Du kan{' '}
            <Link
                href={`${publicEnv.publicPath ?? ''}/dialogmoter/${sykmeldtId}?source=dialogmote-sykmeldinger-veileder`}
                onClick={() => {
                    localStorage.setItem('dialogmote-sykmeldinger-info', 'true')
                }}
            >
                be om et dialogmøte med {name.split(' ')[0]} og NAV
            </Link>{' '}
            hvis dere har behov for det.
        </Veileder>
    )
}

export default DialogmoteSykmeldingerInfoPanel
