import Script from 'next/script'
import React from 'react'

import { browserEnv } from '../../utils/env'

import styles from './UxSignalsWidget.module.css'

function UxSignalsWidget(): JSX.Element | null {
    if (browserEnv.runtimeEnv !== 'prod') return null

    return (
        <>
            <Script
                type="module"
                strategy="lazyOnload"
                src="https://uxsignals-frontend.uxsignals.app.iterate.no/embed.js"
            />
            <div data-uxsignals-embed="study-0s1mp8nu4t" className={styles.uxSignalsContainer} />
        </>
    )
}

export default UxSignalsWidget
