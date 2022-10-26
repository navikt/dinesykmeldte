import React from 'react'
import {
    BandageFilled,
    BellFilled,
    Calender,
    CoApplicant,
    Dialog,
    Findout,
    People,
    Sandglass,
    SuccessFilled,
    TaskFilled,
} from '@navikt/ds-icons'
import { logger } from '@navikt/next-logger'

export type Icons =
    | 'Dialog'
    | 'CoApplicant'
    | 'Findout'
    | 'Calendar'
    | 'Sandglass'
    | 'BellFilled'
    | 'TaskFilled'
    | 'SuccessFilled'
    | 'BandageFilled'

interface Props {
    className?: string
    icon: Icons
}

const TimelineIcon = ({ className, icon }: Props): JSX.Element => {
    const Icon = iconToComponent(icon)
    return <Icon className={className} />
}

function iconToComponent(icon: Icons): typeof Dialog {
    switch (icon) {
        case 'Dialog':
            return Dialog
        case 'CoApplicant':
            return CoApplicant
        case 'Findout':
            return Findout
        case 'Calendar':
            return Calender
        case 'Sandglass':
            return Sandglass
        case 'BandageFilled':
            return BandageFilled
        case 'BellFilled':
            return BellFilled
        case 'TaskFilled':
            return TaskFilled
        case 'SuccessFilled':
            return SuccessFilled
        default:
            logger.error(`Unknown icon: "${icon}"`)
            return People
    }
}

export default TimelineIcon
