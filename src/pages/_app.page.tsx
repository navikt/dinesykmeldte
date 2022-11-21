import '@navikt/dinesykmeldte-sidemeny/dist/style.css'
import '../style/global.css'

import React, { ComponentType, PropsWithChildren, useEffect, useState } from 'react'
import type { AppProps as NextAppProps } from 'next/app'
import { Modal } from '@navikt/ds-react'
import { ApolloProvider } from '@apollo/client'
import { Provider } from 'react-redux'
import { configureLogger } from '@navikt/next-logger'

import ErrorBoundary from '../components/shared/errors/ErrorBoundary'
import { PrefetchResults } from '../shared/types'
import { useHandleDecoratorClicks } from '../hooks/useBreadcrumbs'
import { createClientApolloClient } from '../graphql/apollo'
import { store } from '../state/store'
import metadataSlice from '../state/metadataSlice'
import { initAmplitude } from '../amplitude/amplitude'
import { PAGE_SIZE_KEY, paginationSlice } from '../state/paginationSlice'
import UnsupportedBrowser from '../components/UserWarnings/UnsupportedBrowser/UnsupportedBrowser'
import LoggedOut from '../components/UserWarnings/LoggedOut/LoggedOut'
import NewVersionWarning from '../components/NewVersionWarning/NewVersionWarning'
import { LabsWarning } from '../components/LabsWarning/LabsWarning'

export interface AppProps extends Omit<NextAppProps, 'pageProps' | 'Component'> {
    pageProps: PropsWithChildren<unknown> & Partial<PrefetchResults>
    Component: ComponentType<PropsWithChildren<unknown>>
}

configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
})

initAmplitude()

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useHandleDecoratorClicks()
    useHandleVersion(pageProps.version)
    useHydratePageSize()

    const [apolloClient] = useState(() => createClientApolloClient(pageProps))

    useEffect(() => {
        Modal.setAppElement?.('#__next')
    }, [])

    return (
        <ErrorBoundary>
            <Provider store={store}>
                <ApolloProvider client={apolloClient}>
                    <LabsWarning />
                    <LoggedOut />
                    <NewVersionWarning />
                    <main id="maincontent" role="main">
                        {!pageProps.isIE ? <Component {...pageProps} /> : <UnsupportedBrowser />}
                    </main>
                </ApolloProvider>
            </Provider>
        </ErrorBoundary>
    )
}

function useHydratePageSize(): void {
    useEffect(() => {
        const persistedPageSize = +(localStorage.getItem(PAGE_SIZE_KEY) ?? 5)
        store.dispatch(paginationSlice.actions.setPageSize(persistedPageSize))
    }, [])
}

function useHandleVersion(version: string | null | undefined): void {
    useEffect(() => {
        if (!version) return

        store.dispatch(metadataSlice.actions.setVersion(version))
    }, [version])
}

export default MyApp
