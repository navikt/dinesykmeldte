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
        <div className="flex items-center py-4">
            <Icon className="mr-2 text-2xl" role="img" aria-hidden />
            <Heading id={headingId} size="small" level="3">
                {title}
            </Heading>
        </div>
    )
}
