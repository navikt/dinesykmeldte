import { Alert, Link } from '@navikt/ds-react'
import React from 'react'

import styles from './SykepengerBeforeChristmas.module.css'

export function SykepengerBeforeChristmas(): JSX.Element | null {
    return (
        <Alert className={styles.limit} variant="warning" role="status" aria-live="polite">
            Sykepenger før jul -{' '}
            <Link
                href="https://www.nav.no/no/bedrift/inkluderende-arbeidsliv/nyheter-fra-hele-landet/sykepenger-for-jul--viktig-beskjed-til-arbeidsgivere"
                target="_blank"
                rel="noopener noreferrer"
            >
                viktig beskjed til arbeidsgivere som ikke alltid forskutterer
            </Link>
        </Alert>
    )
}
