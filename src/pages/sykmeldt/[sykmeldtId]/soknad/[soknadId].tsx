import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { PersonIcon } from "@navikt/aksel-icons";
import { ChildPages, PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import { BodyLong, Heading } from "@navikt/ds-react";
import { logger } from "@navikt/next-logger";
import Head from "next/head";
import type { ReactElement } from "react";
import { withAuthenticatedPage } from "../../../../auth/withAuthentication";
import PageSideMenu from "../../../../components/PageSideMenu/PageSideMenu";
import PageError from "../../../../components/shared/errors/PageError";
import PageFallbackLoader from "../../../../components/shared/pagefallbackloader/PageFallbackLoader";
import SoknadPanel from "../../../../components/soknadpanel/SoknadPanel";
import SykmeldingPanelShort from "../../../../components/sykmeldingpanelshort/SykmeldingPanelShort";
import {
  MarkSoknadReadDocument,
  MineSykmeldteDocument,
  SoknadByIdDocument,
  type SoknadByIdQuery,
} from "../../../../graphql/queries/graphql.generated";
import {
  createSoknadBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../../hooks/useBreadcrumbs";
import useParam, { RouteLocation } from "../../../../hooks/useParam";
import { useSykmeldt } from "../../../../hooks/useSykmeldt";
import { fnrText, formatNameSubjective } from "../../../../utils/sykmeldtUtils";

function SoknadIdPage(): ReactElement {
  const sykmeldtQuery = useSykmeldt();
  const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad);
  const markSoknadRead = useMarkReadMutation();
  const { data, error, loading } = useQuery(SoknadByIdDocument, {
    variables: { soknadId },
    onCompleted: async (data) => {
      if (data.soknad == null || data.soknad.lest) return;

      await markSoknadRead(soknadId);
    },
  });
  const hasError = error || sykmeldtQuery.error;
  const sykmeldtName = formatNameSubjective(sykmeldtQuery.sykmeldt?.navn);

  useUpdateBreadcrumbs(
    () => createSoknadBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
    [sykmeldtId, sykmeldtQuery.sykmeldt],
  );

  return (
    <PageContainer
      header={{
        Icon: PersonIcon,
        title: `Søknad for ${sykmeldtName}`,
        subtitle: sykmeldtQuery.sykmeldt && fnrText(sykmeldtQuery.sykmeldt.fnr),
        subtitleSkeleton: !sykmeldtQuery.error,
      }}
      sykmeldt={sykmeldtQuery.sykmeldt}
      navigation={
        <PageSideMenu
          sykmeldt={sykmeldtQuery.sykmeldt}
          activePage={ChildPages.Soknad}
        />
      }
    >
      <Head>
        <title>Søknad - Dine Sykmeldte - nav.no</title>
      </Head>
      {!hasError && (
        <section className="mb-10 max-w-2xl" aria-labelledby="mottatt-søknad">
          <Heading id="mottatt-søknad" className="mb-1" level="2" size="xsmall">
            Du har mottatt en søknad om sykepenger
          </Heading>
          <BodyLong size="small">
            Her skal du bare sjekke om du ser noen feil i utfyllingen. I
            tilfelle gir du {formatNameSubjective(data?.soknad?.navn)} beskjed
            om å sende søknaden på nytt.
          </BodyLong>
        </section>
      )}
      {loading && <PageFallbackLoader text="Laster søknad" />}
      {hasError && (
        <PageError
          text="Klarte ikke å laste denne søknaden"
          cause={
            error?.message ??
            sykmeldtQuery.error?.message ??
            "Unknown (soknad page)"
          }
        />
      )}
      {data?.soknad?.sykmeldingId && !hasError && (
        <>
          <SoknadPanel soknad={data.soknad} />
          <SykmeldingPanelShort sykmeldingId={data.soknad.sykmeldingId} />
        </>
      )}
    </PageContainer>
  );
}

function useMarkReadMutation(): (soknadId: string) => Promise<void> {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation(MarkSoknadReadDocument);

  return async (soknadId) => {
    try {
      await mutate({
        variables: { soknadId },
        refetchQueries: [{ query: MineSykmeldteDocument }],
      });
      logger.info(`Marked søknad ${soknadId} as read`);

      const existingSoknadQuery = apolloClient.readQuery({
        query: SoknadByIdDocument,
        variables: { soknadId },
      });
      if (existingSoknadQuery?.soknad == null) return;

      const nySoknad: SoknadByIdQuery = {
        __typename: "Query",
        soknad: { ...existingSoknadQuery.soknad, lest: true },
      };
      apolloClient.writeQuery({
        query: SoknadByIdDocument,
        variables: { soknadId },
        data: nySoknad,
      });
    } catch (e) {
      logger.error(`Unable to mark søknad ${soknadId} as read`);
      throw e;
    }
  };
}

export const getServerSideProps = withAuthenticatedPage();

export default SoknadIdPage;
