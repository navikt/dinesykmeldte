import React from 'react'
import { Alert, Link } from '@navikt/ds-react'
import { useSelector } from 'react-redux'

import { RootState } from '../../state/store'

import styles from './NewVersionWarning.module.css'

const NewVersionWarning = (): JSX.Element | null => {
    const stale = useSelector((state: RootState) => state.metadata.stale)

    if (!stale) return null

    return (
        <Alert variant="info" className={styles.newVersion} role="status" aria-live="polite">
            Det har kommet en ny versjon av nettsiden. Trykk her{' '}
            <Link href={window.location.pathname}>for å laste nyeste versjon</Link>.
        </Alert>
    )
}

export default NewVersionWarning
