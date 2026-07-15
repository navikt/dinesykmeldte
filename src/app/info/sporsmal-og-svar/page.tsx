import type { Metadata } from "next";
import MarkdownPage from "../../../components/MarkdownPage/MarkdownPage";
import { markdownFileToSource } from "../../../components/MarkdownPage/staticMarkdownUtils";
import { SporsmalOgSvarBreadcrumbs } from "./SporsmalOgSvarBreadcrumbs";

export const metadata: Metadata = {
  title: "Spørsmål og svar om dine sykmeldte | Dine sykmeldte",
};

export default async function SporsmalOgSvarPage() {
  const source = await markdownFileToSource("sporsmal-og-svar.mdx");

  return (
    <>
      <SporsmalOgSvarBreadcrumbs />
      <MarkdownPage
        title="Spørsmål og svar om dine sykmeldte"
        source={source}
      />
    </>
  );
}
