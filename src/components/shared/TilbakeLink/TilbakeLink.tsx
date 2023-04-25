import React from 'react'
import Link from 'next/link'
import { Link as DsLink } from '@navikt/ds-react'
import { Back } from '@navikt/ds-icons'

import { cn } from '../../../utils/tw-utils'

interface TilbakeLinkProps {
    text: string
    marginTop?: boolean
    href: string
}

function TilbakeLink({ text, marginTop, href }: TilbakeLinkProps): JSX.Element {
    return (
        <Link href={href} passHref legacyBehavior>
            <DsLink className={cn('mb-12 mt-4', { 'mt-4': marginTop })}>
                <Back role="img" aria-hidden />
                {text}
            </DsLink>
        </Link>
    )
}
export default TilbakeLink
