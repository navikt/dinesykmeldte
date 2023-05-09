import React, { PropsWithChildren, ReactNode } from 'react'
import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react'

import { cn } from '../../../utils/tw-utils'
import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

interface Props {
    title?: string
    text?: string | string[]
    border?: boolean
    illustration?: ReactNode
    flexWrap?: boolean
}

function Veileder({
    children,
    title,
    text,
    border = true,
    illustration,
    flexWrap,
}: PropsWithChildren<Props>): JSX.Element {
    useLogAmplitudeEvent({
        eventName: 'guidepanel vist',
        data: { tekst: Array.isArray(text) ? text[0] : text, komponent: 'Veileder' },
    })

    return (
        <div
            className={cn(
                'mb-4 flex items-center justify-center print:hidden',
                {
                    'disableBorder [&_p:not(:last-of-type)]:mb-3 [&_p]:m-0': !border,
                },
                {
                    'flexWrap mb-12': flexWrap,
                },
            )}
        >
            <GuidePanel
                className={cn(
                    'mx-12 flex w-full items-center [&_p]:text-base',
                    'last-of-type:[.disableBorder_&>div]:border-none',
                    'first-of-type:[.flexWrap_&>div]:relative first-of-type:[.flexWrap_&>div]:top-0 first-of-type:[.flexWrap_&>div]:-mr-6',
                    'last-of-type:[.flexWrap_&>div]:flex last-of-type:[.flexWrap_&>div]:flex-wrap last-of-type:[.flexWrap_&>div]:content-center last-of-type:[.flexWrap_&>div]:p-0',
                    'max-[425px]:first-of-type:[.flexWrap_&>div]:ml-12 max-[768px]:[.flexWrap_&]:m-0 max-[425px]:[.flexWrap_&]:flex-col max-[425px]:[.flexWrap_&]:p-0',
                )}
                illustration={illustration}
            >
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
                                <BodyLong
                                    key={it}
                                    className={cn('leading-normal', { 'mb-3': index !== text.length - 1 })}
                                >
                                    {it}
                                </BodyLong>
                            ),
                    )
                )}
                {children}
            </GuidePanel>
        </div>
    )
}

export default Veileder
