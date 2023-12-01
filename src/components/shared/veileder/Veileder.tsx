import React, { ReactElement, PropsWithChildren, ReactNode } from 'react'
import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react'

import { cn } from '../../../utils/tw-utils'
import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

import styles from './Veileder.module.css'

interface Props {
    title?: string
    text?: string | string[]
    illustration?: ReactNode
    veilederMerInfo?: boolean
}

export function Veileder({
    children,
    title,
    text,
    illustration,
    veilederMerInfo,
}: PropsWithChildren<Props>): ReactElement {
    return (
        <GuidePanel
            className={cn('mx-12 print:hidden max-w-2xl', styles.veileder, styles.noBorder, {
                [styles.centerContent]: !veilederMerInfo,
            })}
            illustration={illustration}
            aria-label="Veiledende informasjon"
        >
            <VeilederBody title={title} text={text} />
            {children}
        </GuidePanel>
    )
}

export function VeilederBorder({
    children,
    title,
    text,
    illustration,
}: PropsWithChildren & Pick<Props, 'title' | 'text' | 'illustration'>): ReactElement {
    return (
        <GuidePanel className="mb-12 print:hidden" illustration={illustration} aria-label="Veiledende informasjon">
            <VeilederBody title={title} text={text} />
            {children}
        </GuidePanel>
    )
}

function VeilederBody({ title, text }: Pick<Props, 'title' | 'text'>): ReactElement {
    useLogAmplitudeEvent({
        eventName: 'guidepanel vist',
        data: { tekst: Array.isArray(text) ? text[0] : text, komponent: 'Veileder' },
    })

    return (
        <>
            {title && (
                <Heading level="2" size="small" spacing>
                    {title}
                </Heading>
            )}
            {typeof text === 'string' ? (
                <BodyLong className="leading-normal">{text}</BodyLong>
            ) : (
                text?.map(
                    (it, index) =>
                        it !== '' && (
                            <BodyLong key={it} className={cn('leading-normal', { 'mb-3': index !== text.length - 1 })}>
                                {it}
                            </BodyLong>
                        ),
                )
            )}
        </>
    )
}
