import { BodyShort, Heading } from '@navikt/ds-react'
import React from 'react'

import { cn } from '../../../utils/tw-utils'
import { cleanId } from '../../../utils/stringUtils'

interface ListItemProps {
    title: string
    text: string | string[]
    headingLevel: '2' | '3' | '4' | '5' | '6'
    blueListItem?: boolean
}

export function ListItem({ title, text, headingLevel, blueListItem }: ListItemProps): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li
            className={cn('mb-7 mt-4 no-underline', { 'mb-5 rounded bg-blue-50 p-5': blueListItem })}
            aria-labelledby={listItemId}
        >
            <Heading id={listItemId} size="xsmall" className="mb-1" level={headingLevel}>
                {title}
            </Heading>
            {Array.isArray(text) ? (
                <ul className="list-none p-0">
                    {text.map((it) => (
                        <BodyShort className="mb-1 last-of-type:m-0" key={it} as="li" size="small">
                            {it}
                        </BodyShort>
                    ))}
                </ul>
            ) : (
                <BodyShort className="mb-1 last-of-type:m-0" size="small">
                    {text}
                </BodyShort>
            )}
        </li>
    )
}
