import React, { ReactElement } from 'react'
import Head from 'next/head'
import { PersonGroupIcon } from '@navikt/aksel-icons'
import { PageContainer } from '@navikt/dinesykmeldte-sidemeny'
import dynamic from 'next/dynamic'

import { createSsrApolloClient, prefetchMutlipleQueries, wrapProps } from '../graphql/prefetching'
import { GetServerSidePropsPrefetchResult } from '../shared/types'
import SykmeldteList from '../components/sykmeldte/SykmeldteList'
import SykmeldteInfoPanel from '../components/SykmeldtInfoPanel/SykmeldteInfoPanel'
import { withAuthenticatedPage } from '../auth/withAuthentication'
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs'
import NarmestelederInfo from '../components/NarmestelederInfo/NarmestelederInfo'
import { MineSykmeldteDocument, VirksomheterDocument } from '../graphql/queries/graphql.generated'
import VirksomhetPicker from '../components/virksomhetpicker/VirksomhetPicker'

const DialogmoteInfoPanel: React.ComponentType = dynamic(
    () => import('../components/DialogmoteInfoPanel/DialogmoteInfoPanel'),
    {
        ssr: false,
    },
)

function Home(): ReactElement {
    useUpdateBreadcrumbs(() => [])

    return (
        <PageContainer header={{ Icon: PersonGroupIcon, title: 'Dine sykmeldte' }} headerRight={<VirksomhetPicker />}>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <SykmeldteInfoPanel />
            <DialogmoteInfoPanel />
            <SykmeldteList />
            <NarmestelederInfo />
        </PageContainer>
    )
}

export const getServerSideProps = withAuthenticatedPage(
    async (context, version, isIE): Promise<GetServerSidePropsPrefetchResult> => {
        const client = createSsrApolloClient(context.req)

        if (context.req.url?.startsWith('/_next')) {
            // When navigating to root on the client side, don't SSR-fetch queries again
            return { props: { version, isIE } }
        }

        await prefetchMutlipleQueries([
            client.query({ query: MineSykmeldteDocument }),
            client.query({ query: VirksomheterDocument }),
        ])

        return {
            props: wrapProps(client, version, isIE),
        }
    },
)

export default Home
