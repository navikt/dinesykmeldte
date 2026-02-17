import type { GetStaticPropsResult } from "next";
import React, { type ReactElement } from "react";
import MarkdownPage, {
  type StaticMarkdownPageProps,
} from "../../components/MarkdownPage/MarkdownPage";
import { markdownFileToSource } from "../../components/MarkdownPage/staticMarkdownUtils";
import {
  createOppfolgingBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../hooks/useBreadcrumbs";

const Oppfolging = ({ source }: StaticMarkdownPageProps): ReactElement => {
  useUpdateBreadcrumbs(() => createOppfolgingBreadcrumbs(), []);

  return (
    <MarkdownPage title="Oppfølging underveis i sykefraværet" source={source} />
  );
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<StaticMarkdownPageProps>
> {
  return {
    props: {
      source: await markdownFileToSource("oppfolging.mdx"),
    },
  };
}

export default Oppfolging;
