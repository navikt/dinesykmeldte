import React, { ReactElement, useEffect } from 'react'
import { ContentContainer } from '@navikt/ds-react'
import { useRouter } from 'next/router'

import { registerClientMetric } from '../utils/clientMetric'
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs'
import PageError from '../components/shared/errors/PageError'
import LinkButton from '../components/shared/links/LinkButton'

function NotFound(): ReactElement | boolean {
    const router = useRouter()
    useUpdateBreadcrumbs(() => [{ title: 'Ukjent side' }])

    useEffect(() => {
        registerClientMetric({ type: '404', path: window.location.pathname })
    }, [])

    return (
        <ContentContainer style={{ maxWidth: '50rem' }}>
            <PageError
                graphic="mom"
                noReload
                text="Siden du leter etter finnes ikke"
                cause="Page not found (404)"
                details={
                    <ul>
                        <li>Skrev du inn adressen direkte kan du se om den er stavet riktig.</li>
                        <li>Klikket du på en lenke er den feil eller utdatert.</li>
                        <li>
                            <LinkButton onClick={() => router.back()}>Gå tilbake</LinkButton> til den forrige siden
                            eller
                        </li>
                    </ul>
                }
                action={null}
            />
        </ContentContainer>
    )
}

export default NotFound
