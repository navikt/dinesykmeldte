import React, { PropsWithChildren } from 'react'

import styles from './BlueInfoSection.module.css'

interface BlueInfoSectionProps {
    ariaLabelledBy?: string
}

export function BlueInfoSection({ ariaLabelledBy, children }: PropsWithChildren<BlueInfoSectionProps>): JSX.Element {
    return (
        <section aria-labelledby={ariaLabelledBy} className={styles.infoSection}>
            {children}
        </section>
    )
}
