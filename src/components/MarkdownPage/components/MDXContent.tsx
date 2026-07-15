"use client";

import { BodyLong, Heading, Link } from "@navikt/ds-react";
import type { MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import { MDXRemote } from "next-mdx-remote";
import TilbakeLink from "../../shared/TilbakeLink/TilbakeLink";
import ExpandableInfo from "./ExpandableInfo";
import KontaktInfoPanel from "./KontaktInfoPanel";
import SporsmalOgSvarWrapper from "./SporsmalOgSvarWrapper";
import Timeline, { TimelineEntry } from "./Timeline";

// Re-export so MarkdownPage.tsx can type the `source` prop without importing
// next-mdx-remote directly (which would place it in the SSR chunk).
export type { MDXRemoteSerializeResult };

const components: MDXRemoteProps["components"] = {
  // Native HTML → Aksel
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

interface Props {
  source: MDXRemoteSerializeResult;
}

export default function MDXContent({ source }: Props) {
  return <MDXRemote {...source} components={components} />;
}
