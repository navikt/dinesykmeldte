import React, { PropsWithChildren } from 'react'
import { Heading } from '@navikt/ds-react'

interface Props {
    id: string
    title: string
}

function ListSection({ id, title, children }: PropsWithChildren<Props>): JSX.Element {
    return (
        <section aria-labelledby={id} className="mb-16">
            <Heading id={id} size="medium" level="2" className="mb-2">
                {title}
            </Heading>
            {children}
        </section>
    )
}

export function SectionListRoot({ children }: PropsWithChildren<unknown>): JSX.Element {
    return <div>{children}</div>
}

export default ListSection
