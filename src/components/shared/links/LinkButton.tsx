import React, { PropsWithChildren } from 'react'
import { Link } from '@navikt/ds-react'

interface Props {
    onClick: () => void
}

const LinkButton = ({ onClick, children }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <Link as="button" onClick={onClick}>
            {children}
        </Link>
    )
}

export default LinkButton
