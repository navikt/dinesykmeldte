import React from 'react'
import Link from 'next/link'
import { Link as DsLink } from '@navikt/ds-react'
import { Back } from '@navikt/ds-icons'
import cn from 'classnames'

import styles from './TilbakeLink.module.css'

interface TilbakeLinkProps {
    text: string
    marginTop?: boolean
    href: string
}

function TilbakeLink({ text, marginTop, href }: TilbakeLinkProps): JSX.Element {
    return (
        <Link href={href} passHref legacyBehavior>
            <DsLink className={cn(styles.tilbakeLink, { [styles.marginTop]: marginTop })}>
                <Back role="img" aria-hidden />
                {text}
            </DsLink>
        </Link>
    )
}
export default TilbakeLink
