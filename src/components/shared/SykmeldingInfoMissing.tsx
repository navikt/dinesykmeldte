import { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

interface Props {
    heading?: string
    text: string
}

function SykmeldingInfoMissing({ heading, text }: Props): ReactElement {
    return (
        <div className="text-gray-600">
            {heading && (
                <Heading className="text-base" size="xsmall" level="5">
                    {heading}
                </Heading>
            )}
            <BodyShort size="small" as="em">
                {text}
            </BodyShort>
        </div>
    )
}

export default SykmeldingInfoMissing
