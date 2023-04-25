import React from 'react'
import { Heading } from '@navikt/ds-react'

interface Props {
    orgname: string
}

function OrgHeading({ orgname }: Props): JSX.Element {
    return (
        <Heading className="mt-2 pb-4" size="xsmall" level="3" spacing>
            {orgname}
        </Heading>
    )
}

export default OrgHeading
