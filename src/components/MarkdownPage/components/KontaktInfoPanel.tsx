import React, { PropsWithChildren } from 'react'
import { Heading } from '@navikt/ds-react'
import { Telephone } from '@navikt/ds-icons'
import { Clock } from '@navikt/ds-icons'

import styles from './KontaktInfoPanel.module.css'

function KontaktInfoPanel({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <div className={styles.root}>
            {children}
            <Heading size="small" level="3">
                Har du spørsmål som du ikke finner svar på her inne?
            </Heading>
            <div className={styles.infoWrapper}>
                <Telephone />
                <p className={styles.text}>Arbeidsgivertelefonen: 55 55 33 36</p>
            </div>
            <div className={styles.infoWrapper}>
                <Clock />
                <p className={styles.text}>Åpen 8.00 - 15.30 mandag - fredag</p>
            </div>
        </div>
    )
}

export default KontaktInfoPanel
