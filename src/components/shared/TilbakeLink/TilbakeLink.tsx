import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Link as DsLink } from '@navikt/ds-react'
import { ArrowLeftIcon } from '@navikt/aksel-icons'

import { cn } from '../../../utils/tw-utils'

interface TilbakeLinkProps {
    text: string
    marginTop?: boolean
    href: string
}

function TilbakeLink({ text, marginTop, href }: TilbakeLinkProps): ReactElement {
    return (
        <Link href={href} passHref legacyBehavior>
            <DsLink className={cn('mb-12 mt-4', { 'mt-4': marginTop })}>
                <ArrowLeftIcon role="img" aria-hidden />
                {text}
            </DsLink>
        </Link>
    )
}
export default TilbakeLink
