import React, { PropsWithChildren } from 'react'
import { Heading } from '@navikt/ds-react'

import styles from './ListSection.module.css'

interface Props {
    id: string
    title: string
}

function ListSection({ id, title, children }: PropsWithChildren<Props>): JSX.Element {
    return (
        <section aria-labelledby={id} className={styles.sectionRoot}>
            <Heading id={id} size="medium" level="2" className={styles.listHeader}>
                {title}
            </Heading>
            {children}
        </section>
    )
}

export function SectionListRoot({ children }: PropsWithChildren<unknown>): JSX.Element {
    return <div className={styles.sectionListRoot}>{children}</div>
}

export default ListSection
