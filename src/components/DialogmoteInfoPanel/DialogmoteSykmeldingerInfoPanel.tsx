import React, { ReactElement, useEffect } from 'react'
import { Link } from '@navikt/ds-react'

import { VeilederBorder } from '../shared/veileder/Veileder'
import { useSykmeldt } from '../../hooks/useSykmeldt'
import { hasBeenSykmeldt6WeeksWithout16DaysOpphold } from '../../utils/sykmeldtUtils'
import { browserEnv } from '../../utils/env'

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
    }, [hasBeenSykmeldt6Weeks, shouldShow])

    if (!shouldShow || !hasBeenSykmeldt6Weeks) return null

    return (
        <VeilederBorder title="Har dere behov for et dialogmøte?">
            Du kan{' '}
            <Link
                href={browserEnv.dialogmoteUrl + '/' + sykmeldtId}
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
