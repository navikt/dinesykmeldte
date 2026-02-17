import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import { BodyLong, Heading, Link } from "@navikt/ds-react";
import Head from "next/head";
import {
  MDXRemote,
  type MDXRemoteProps,
  type MDXRemoteSerializeResult,
} from "next-mdx-remote";
import React, { type ReactElement } from "react";
import TilbakeLink from "../shared/TilbakeLink/TilbakeLink";
import ExpandableInfo from "./components/ExpandableInfo";
import KontaktInfoPanel from "./components/KontaktInfoPanel";
import SporsmalOgSvarWrapper from "./components/SporsmalOgSvarWrapper";
import Timeline, { TimelineEntry } from "./components/Timeline";

export interface StaticMarkdownPageProps {
  source: MDXRemoteSerializeResult;
}

interface Props extends StaticMarkdownPageProps {
  title: string;
}

const MarkdownPage = ({ title, source }: Props): ReactElement => {
  return (
    <PageContainer header={{ title }}>
      <Head>
        <title>{title}</title>
      </Head>
      <MDXRemote {...source} components={components} />
    </PageContainer>
  );
};

const components: MDXRemoteProps["components"] = {
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
  ul: ({ children }) => <ul className="ml-4 list-disc">{children}</ul>,
  // Custom MDX-components
  ExpandableInfo: ExpandableInfo,
  TimelineEntry: TimelineEntry,
  Timeline: Timeline,
  TilbakeLink: TilbakeLink,
  SporsmalOgSvarWrapper: SporsmalOgSvarWrapper,
  KontaktInfoPanel: KontaktInfoPanel,
};

export default MarkdownPage;
