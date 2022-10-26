import React, { ReactNode } from 'react'
import { Bandage } from '@navikt/ds-icons'
import { BodyShort } from '@navikt/ds-react'
import cn from 'classnames'

import styles from './InfoItem.module.css'

interface InfoItemProps {
    title: string
    text: string | ReactNode
    Icon: typeof Bandage
    smallerIcon?: boolean
}

export function InfoItem({ title, text, Icon, smallerIcon }: InfoItemProps): JSX.Element {
    return (
        <div className={styles.root}>
            <Icon className={cn(styles.icon, { [styles.smallerIcon]: smallerIcon })} />
            <div className={styles.titleAndText}>
                <BodyShort>{title}</BodyShort>
                <BodyShort>{text}</BodyShort>
            </div>
        </div>
    )
}
