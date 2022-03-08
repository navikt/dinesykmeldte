import React from 'react';
import { BodyLong, ContentContainer, Heading, Link } from '@navikt/ds-react';
import { MDXRemote, MDXRemoteProps, MDXRemoteSerializeResult } from 'next-mdx-remote';

import PageWrapper from '../pagewrapper/PageWrapper';
import TilbakeLink from '../shared/TilbakeLink/TilbakeLink';

import ExpandableInfo from './components/ExpandableInfo';
import Timeline, { TimelineEntry } from './components/Timeline';
import SporsmalOgSvarWrapper from './components/SporsmalOgSvarWrapper';
import KontaktInfoPanel from './components/KontaktInfoPanel';

export interface StaticMarkdownPageProps {
    source: MDXRemoteSerializeResult;
}

interface Props extends StaticMarkdownPageProps {
    title: string;
}

const MarkdownPage = ({ title, source }: Props): JSX.Element => {
    return (
        <PageWrapper title={{ title }}>
            <ContentContainer>
                <MDXRemote {...source} components={components} />
            </ContentContainer>
        </PageWrapper>
    );
};

const components: MDXRemoteProps['components'] = {
    // Native components
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
    // Custom MDX-components
    ExpandableInfo: ExpandableInfo,
    TimelineEntry: TimelineEntry,
    Timeline: Timeline,
    TilbakeLink: TilbakeLink,
    SporsmalOgSvarWrapper: SporsmalOgSvarWrapper,
    KontaktInfoPanel: KontaktInfoPanel,
};

export default MarkdownPage;
