"use client";

import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
// Type-only import: erased by TypeScript — does NOT place next-mdx-remote in
// the SSR bundle. All runtime usage lives in ./components/MDXContent.tsx which
// is loaded exclusively client-side via the dynamic import below.
import type { MDXRemoteSerializeResult } from "./components/MDXContent";

export interface StaticMarkdownPageProps {
  source: MDXRemoteSerializeResult;
}

interface Props extends StaticMarkdownPageProps {
  title: string;
}

// Dynamically import the MDX renderer with ssr:false so that next-mdx-remote
// (an ESM-only package) is never included in the Turbopack SSR chunk, which
// would cause "ModuleId not found for ident: [externals]/next-mdx-remote".
const MDXContent = dynamic(() => import("./components/MDXContent"), {
  ssr: false,
});

const MarkdownPage = ({ title, source }: Props): ReactElement => {
  return (
    <PageContainer header={{ title }}>
      <MDXContent source={source} />
    </PageContainer>
  );
};

export default MarkdownPage;
