import React, { ReactElement, PropsWithChildren } from 'react'
import { Heading } from '@navikt/ds-react'

interface Props {
    id: string
    title: string
    bonusAction?: ReactElement
}

function ListSection({ id, title, bonusAction, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <section aria-labelledby={id} className="mb-16">
            <div className="flex gap-4 items-center mb-2 flex-wrap">
                <Heading id={id} size="medium" level="2">
                    {title}
                </Heading>
                {bonusAction}
            </div>
            {children}
        </section>
    )
}

export function SectionListRoot({ children }: PropsWithChildren<unknown>): ReactElement {
    return <div>{children}</div>
}

export default ListSection
