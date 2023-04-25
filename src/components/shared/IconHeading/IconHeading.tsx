import React from 'react'
import { Heading } from '@navikt/ds-react'
import { Calender } from '@navikt/ds-icons'

interface Props {
    headingId: string
    title: string
    Icon: typeof Calender
}

export function IconHeading({ headingId, title, Icon }: Props): JSX.Element {
    return (
        <div className="flex items-center py-4">
            <Icon className="mr-2 text-2xl" role="img" aria-hidden />
            <Heading id={headingId} size="small" level="3">
                {title}
            </Heading>
        </div>
    )
}
