import type { Metadata } from "next";
import MarkdownPage from "../../../components/MarkdownPage/MarkdownPage";
import { markdownFileToSource } from "../../../components/MarkdownPage/staticMarkdownUtils";
import { OppfolgingBreadcrumbs } from "./OppfolgingBreadcrumbs";

export const metadata: Metadata = {
  title: "Oppfølging underveis i sykefraværet | Dine sykmeldte",
};

export default async function OppfolgingPage() {
  const source = await markdownFileToSource("oppfolging.mdx");

  return (
    <>
      <OppfolgingBreadcrumbs />
      <MarkdownPage
        title="Oppfølging underveis i sykefraværet"
        source={source}
      />
    </>
  );
}
