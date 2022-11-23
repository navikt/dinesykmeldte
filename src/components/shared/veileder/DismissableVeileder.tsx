import React, { useEffect, useState } from 'react'
import { Button } from '@navikt/ds-react'

import { logAmplitudeEvent } from '../../../amplitude/amplitude'

import Veileder from './Veileder'
import styles from './DismissableVeileder.module.css'

type Props = {
    storageKey: string
    title?: string
    text: string | string[]
    onOk?: () => void
}

function DismissableVeileder({ storageKey, title, text, onOk }: Props): JSX.Element | null {
    const [hasDismissed, setDismissed] = useState<boolean>(JSON.parse(localStorage.getItem(storageKey) ?? 'false'))

    useEffect(() => {
        if (hasDismissed) return

        logAmplitudeEvent({
            eventName: 'guidepanel vist',
            data: { tekst: title ?? storageKey, komponent: 'DismissableVeileder' },
        })
    }, [hasDismissed, storageKey, title])

    if (hasDismissed) return null

    return (
        <Veileder title={title} text={text}>
            <Button
                size="small"
                className={styles.okButton}
                variant="secondary"
                onClick={() => {
                    localStorage.setItem(storageKey, 'true')
                    setDismissed(true)
                    onOk?.()
                }}
            >
                OK
            </Button>
        </Veileder>
    )
}

export default DismissableVeileder
