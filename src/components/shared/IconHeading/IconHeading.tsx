import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { BandageIcon } from '@navikt/aksel-icons'

interface Props {
    headingId: string
    title: string
    Icon: typeof BandageIcon
}

export function IconHeading({ headingId, title, Icon }: Props): ReactElement {
    return (
        <div className="flex items-center py-2">
            <Icon className="mr-1.5 text-xl --a-surface-warning-moderate" role="img" aria-hidden />
            <Heading id={headingId} size="xsmall" level="3">
                {title}
            </Heading>
        </div>
    )
}
