/* eslint-disable @next/next/no-img-element */
import React from 'react'

import { getPublicEnv } from '../../../utils/env'

const publicEnv = getPublicEnv()

const BASE_PATH = publicEnv.publicPath ?? ''

const UnsupportedBrowser = (): JSX.Element => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                fontFamily: 'sans-serif',
                padding: '16px',
                maxWidth: '700px',
                margin: '0 auto',
            }}
        >
            <img
                alt="NAV veileder som forteller deg at Internet Explorer ikke er støttet"
                src={`${BASE_PATH}/ie/hekkan-i-godstolen.png`}
            />
            <div>
                <h4>Vi støtter ikke Internet Explorer</h4>
                <p>For å bruke Dine Sykmeldte må du bruke en nyere nettleser.</p>
                <a href="https://www.nav.no/no/nav-og-samfunn/kontakt-nav/teknisk-brukerstotte/hjelp-til-personbruker/elektronisk-innsending_kap">
                    Se mer informasjon.
                </a>
            </div>
        </div>
    )
}

export default UnsupportedBrowser
