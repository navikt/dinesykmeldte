import { BodyShort, Heading } from '@navikt/ds-react'
import React from 'react'
import cn from 'classnames'

import { cleanId } from '../../../utils/stringUtils'

import styles from './ListItem.module.css'

interface ListItemProps {
    title: string
    text: string | string[]
    headingLevel: '2' | '3' | '4' | '5' | '6'
    blueListItem?: boolean
}

export function ListItem({ title, text, headingLevel, blueListItem }: ListItemProps): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li className={cn(styles.root, { [styles.blueListItem]: blueListItem })} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" className={styles.heading} level={headingLevel}>
                {title}
            </Heading>
            {Array.isArray(text) ? (
                <ul>
                    {text.map((it) => (
                        <BodyShort key={it} as="li" size="small" className={styles.bodyShort}>
                            {it}
                        </BodyShort>
                    ))}
                </ul>
            ) : (
                <BodyShort size="small" className={styles.bodyShort}>
                    {text}
                </BodyShort>
            )}
        </li>
    )
}
