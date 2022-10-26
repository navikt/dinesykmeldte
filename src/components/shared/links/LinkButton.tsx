import React, { PropsWithChildren } from 'react'
import { Link } from '@navikt/ds-react'

import styles from './LinkButton.module.css'

interface Props {
    onClick: () => void
}

const LinkButton = ({ onClick, children }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <Link className={styles.linkButton} as="button" onClick={onClick}>
            {children}
        </Link>
    )
}

export default LinkButton
