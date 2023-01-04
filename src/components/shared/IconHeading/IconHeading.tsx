import React from 'react'
import { Heading } from '@navikt/ds-react'
import { Calender } from '@navikt/ds-icons'

import styles from './IconHeading.module.css'

interface Props {
    headingId: string
    title: string
    Icon: typeof Calender
}

export function IconHeading({ headingId, title, Icon }: Props): JSX.Element {
    return (
        <div className={styles.root}>
            <Icon role="img" aria-hidden />
            <Heading id={headingId} size="small" level="3">
                {title}
            </Heading>
        </div>
    )
}
