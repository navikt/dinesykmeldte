import React from 'react'
import { Bandage, DialogReportFilled, Sandglass, DecisionCheck, Task } from '@navikt/ds-icons'

import { cn } from '../../../../../utils/tw-utils'
import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/graphql.generated'
import { getPeriodTime } from '../../../../../utils/sykmeldingPeriodUtils'
import { notificationCount } from '../../../../../utils/sykmeldtUtils'
import NotifcationDot from '../../../NotifcationDot/NotifcationDot'
import InfoIcon from '../../../icons/InfoIcon'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
    notification: boolean
    notSentSoknad: boolean
}

function SykmeldtIcon({ sykmeldt, notification, notSentSoknad }: Props): JSX.Element {
    const iconVariant = getIconVariant(sykmeldt, notification, notSentSoknad)
    const notifications = notificationCount(sykmeldt)
    const tooltip = notifications > 1 ? `Du har ${notifications} uleste varsler` : `Du har 1 ulest varsel`

    return (
        <div
            className={cn('relative flex h-16 w-16 flex-auto items-center justify-center rounded-full bg-blue-500', {
                'bg-white [&>svg]:text-blue-900': iconVariant === 'sykmeldt',
                'bg-white [&>svg]:text-orange-400': iconVariant === 'notify',
                'bg-white [&>svg]:text-green-900': iconVariant === 'friskmeldt',
                'bg-blue-50 [&>svg]:text-2xl [&>svg]:text-blue-900': iconVariant === 'future',
                'bg-white': iconVariant === 'notSentSoknad',
            })}
        >
            <SykmeldtCardIcon variant={iconVariant} />
            {notifications > 0 && <NotifcationDot notifications={notifications} tooltip={tooltip} />}
        </div>
    )
}

type IconVariant = 'notify' | 'sykmeldt' | 'friskmeldt' | 'future' | 'notSentSoknad'

function getIconVariant(sykmeldt: PreviewSykmeldtFragment, notification: boolean, notSentSoknad: boolean): IconVariant {
    const time = getPeriodTime(sykmeldt.sykmeldinger)

    if (notification) {
        return 'notify'
    } else if (notSentSoknad) {
        return 'notSentSoknad'
    } else if (time === 'future') {
        return 'future'
    } else if (!sykmeldt.friskmeldt) {
        return 'sykmeldt'
    } else {
        return 'friskmeldt'
    }
}

function SykmeldtCardIcon({ variant }: { variant: IconVariant }): JSX.Element {
    switch (variant) {
        case 'notify':
            return <DialogReportFilled fontSize="2rem" role="img" aria-hidden />
        case 'sykmeldt':
            return <Bandage fontSize="2rem" role="img" aria-hidden />
        case 'friskmeldt':
            return <DecisionCheck fontSize="2.2rem" role="img" aria-hidden />
        case 'future':
            return <Sandglass fontSize="2rem" role="img" aria-hidden />
        case 'notSentSoknad':
            return <NotSentSoknadIcon />
    }
}

function NotSentSoknadIcon(): JSX.Element {
    return (
        <div className="relative top-1">
            <Task className="relative top-2 text-3xl" role="img" aria-hidden />
            <InfoIcon className="relative bottom-2 left-3" role="img" aria-hidden />
        </div>
    )
}

export default SykmeldtIcon
