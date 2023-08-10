import React, { ReactElement, PropsWithChildren } from 'react'
import { Link } from '@navikt/ds-react'

interface Props {
    onClick: () => void
}

const LinkButton = ({ onClick, children }: PropsWithChildren<Props>): ReactElement => {
    return (
        <Link as="button" onClick={onClick}>
            {children}
        </Link>
    )
}

export default LinkButton
