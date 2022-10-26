import React from 'react'
import { GetStaticPropsResult } from 'next'

import MarkdownPage, { StaticMarkdownPageProps } from '../../components/MarkdownPage/MarkdownPage'
import { markdownFileToSource } from '../../components/MarkdownPage/staticMarkdownUtils'
import { createOppfolgingBreadcrumbs, useUpdateBreadcrumbs } from '../../hooks/useBreadcrumbs'

const Oppfolging = ({ source }: StaticMarkdownPageProps): JSX.Element => {
    useUpdateBreadcrumbs(() => createOppfolgingBreadcrumbs(), [])

    return <MarkdownPage title="Oppfølging underveis i sykefraværet" source={source} />
}

export async function getStaticProps(): Promise<GetStaticPropsResult<StaticMarkdownPageProps>> {
    return {
        props: {
            source: await markdownFileToSource('oppfolging.mdx'),
        },
    }
}

export default Oppfolging
