import React, { PropsWithChildren, ReactNode } from 'react'
import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react'
import cn from 'classnames'

import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

import styles from './Veileder.module.css'

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
            className={cn(styles.veilederWrapper, { [styles.disableBorder]: !border }, { [styles.flexWrap]: flexWrap })}
        >
            <GuidePanel className={styles.veilederPanel} illustration={illustration}>
                {title && (
                    <Heading level="2" size="small" spacing>
                        {title}
                    </Heading>
                )}
                {typeof text === 'string' ? (
                    <BodyLong>{text}</BodyLong>
                ) : (
                    text?.map(
                        (it, index) =>
                            it !== '' && (
                                <BodyLong
                                    key={it}
                                    className={cn({ [styles.bodyLongMargin]: index !== text.length - 1 })}
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
