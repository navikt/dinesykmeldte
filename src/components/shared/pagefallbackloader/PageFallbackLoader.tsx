import React from 'react'
import { Loader } from '@navikt/ds-react'

interface Props {
    text: string
}

const PageFallbackLoader = ({ text }: Props): JSX.Element => {
    return (
        <div className="flex h-24 items-center justify-center">
            <Loader aria-label={text} title={text} size="2xlarge" />
        </div>
    )
}

export default PageFallbackLoader
