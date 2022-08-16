import Script from 'next/script';
import React from 'react';

import { getPublicEnv } from '../../utils/env';

import styles from './UxSignalsWidget.module.css';

function UxSignalsWidget(): JSX.Element | null {
    if (getPublicEnv().runtimeEnv !== 'prod') return null;

    return (
        <>
            <Script
                type="module"
                strategy="lazyOnload"
                src="https://uxsignals-frontend.uxsignals.app.iterate.no/embed.js"
            />
            <div data-uxsignals-embed="study-tqoydinmkv" className={styles.uxSignalsContainer} />
        </>
    );
}

export default UxSignalsWidget;
