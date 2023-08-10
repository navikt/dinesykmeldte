import React, { ReactElement } from 'react'
import { GetStaticPropsResult } from 'next'

import MarkdownPage, { StaticMarkdownPageProps } from '../../components/MarkdownPage/MarkdownPage'
import { markdownFileToSource } from '../../components/MarkdownPage/staticMarkdownUtils'
import { createSporsmalOgSvarBreadcrumbs, useUpdateBreadcrumbs } from '../../hooks/useBreadcrumbs'

const SporsmalOgSvarPage = ({ source }: StaticMarkdownPageProps): ReactElement => {
    useUpdateBreadcrumbs(() => createSporsmalOgSvarBreadcrumbs(), [])

    return <MarkdownPage title="Spørsmål og svar om dine sykmeldte" source={source} />
}

export async function getStaticProps(): Promise<GetStaticPropsResult<StaticMarkdownPageProps>> {
    return {
        props: {
            source: await markdownFileToSource('sporsmal-og-svar.mdx'),
        },
    }
}

export default SporsmalOgSvarPage
