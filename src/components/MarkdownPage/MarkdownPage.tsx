import React, { ReactElement } from 'react'
import { BodyLong, Heading, Link } from '@navikt/ds-react'
import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { PageContainer } from '@navikt/dinesykmeldte-sidemeny'
import Head from 'next/head'

import TilbakeLink from '../shared/TilbakeLink/TilbakeLink'

import ExpandableInfo from './components/ExpandableInfo'
import Timeline, { TimelineEntry } from './components/Timeline'
import SporsmalOgSvarWrapper from './components/SporsmalOgSvarWrapper'
import KontaktInfoPanel from './components/KontaktInfoPanel'

export interface StaticMarkdownPageProps {
    source: MDXRemoteSerializeResult
}

interface Props extends StaticMarkdownPageProps {
    title: string
}

const MarkdownPage = ({ title, source }: Props): ReactElement => {
    return (
        <PageContainer header={{ title }}>
            <Head>
                <title>{title}</title>
            </Head>
            <MDXRemote {...source} components={components} />
        </PageContainer>
    )
}

const components: MDXRemoteProps['components'] = {
    // Native components
    h1: ({ children }) => (
        <Heading size="large" level="1">
            {children}
        </Heading>
    ),
    h2: ({ children }) => (
        <Heading size="medium" level="2">
            {children}
        </Heading>
    ),
    h3: ({ children }) => (
        <Heading size="small" level="3">
            {children}
        </Heading>
    ),
    p: ({ children }) => <BodyLong spacing>{children}</BodyLong>,
    a: ({ children, href }) => (
        <Link href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </Link>
    ),
    ul: ({ children }) => <ul className="list-disc ml-4">{children}</ul>,
    // Custom MDX-components
    ExpandableInfo: ExpandableInfo,
    TimelineEntry: TimelineEntry,
    Timeline: Timeline,
    TilbakeLink: TilbakeLink,
    SporsmalOgSvarWrapper: SporsmalOgSvarWrapper,
    KontaktInfoPanel: KontaktInfoPanel,
}

export default MarkdownPage
