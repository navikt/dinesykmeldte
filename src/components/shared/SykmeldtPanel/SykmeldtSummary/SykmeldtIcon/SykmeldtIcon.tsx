import React from 'react'
import { Bandage, DialogReportFilled, Sandglass, SuccessStroke, Task } from '@navikt/ds-icons'
import cn from 'classnames'

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/graphql.generated'
import { getPeriodTime } from '../../../../../utils/sykmeldingPeriodUtils'
import { notificationCount } from '../../../../../utils/sykmeldtUtils'
import NotifcationDot from '../../../NotifcationDot/NotifcationDot'
import InfoIcon from '../../../icons/InfoIcon'

import styles from './SykmeldtIcon.module.css'

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
            className={cn(styles.listItemPeopleIconWrapper, {
                [styles.sykmeldt]: iconVariant === 'sykmeldt',
                [styles.notify]: iconVariant === 'notify',
                [styles.friskmeldt]: iconVariant === 'friskmeldt',
                [styles.future]: iconVariant === 'future',
                [styles.notSentSoknad]: iconVariant === 'notSentSoknad',
            })}
        >
            <SykmeldtCardIcon variant={iconVariant} />
            {notifications > 0 && <NotifcationDot notifications={notifications} tooltip={tooltip} absolute />}
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
            return <SuccessStroke fontSize="2rem" role="img" aria-hidden />
        case 'future':
            return <Sandglass fontSize="2rem" role="img" aria-hidden />
        case 'notSentSoknad':
            return <NotSentSoknadIcon />
    }
}

function NotSentSoknadIcon(): JSX.Element {
    return (
        <div className={styles.notSentSoknadIcon}>
            <Task className={styles.taskIcon} role="img" aria-hidden />
            <InfoIcon className={styles.infoIcon} role="img" aria-hidden />
        </div>
    )
}

export default SykmeldtIcon
