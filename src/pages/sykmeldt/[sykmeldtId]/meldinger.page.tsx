import React, { ReactElement } from "react";
import Head from "next/head";
import { PersonIcon } from "@navikt/aksel-icons";
import { PageContainer, RootPages } from "@navikt/dinesykmeldte-sidemeny";
import { withAuthenticatedPage } from "../../../auth/withAuthentication";
import PageSideMenu from "../../../components/PageSideMenu/PageSideMenu";
import MeldingerList from "../../../components/meldinger/MeldingerList";
import PageError from "../../../components/shared/errors/PageError";
import PageFallbackLoader from "../../../components/shared/pagefallbackloader/PageFallbackLoader";
import {
  createMeldingerBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../hooks/useBreadcrumbs";
import useFocusRefetch from "../../../hooks/useFocusRefetch";
import { useSykmeldt } from "../../../hooks/useSykmeldt";
import { fnrText, formatNameSubjective } from "../../../utils/sykmeldtUtils";

const MeldingerPage = (): ReactElement => {
  const { isLoading, sykmeldtId, sykmeldt, error, refetch } = useSykmeldt();
  const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

  useFocusRefetch(refetch);
  useUpdateBreadcrumbs(
    () => createMeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn),
    [sykmeldt?.navn, sykmeldtId],
  );

  return (
    <PageContainer
      header={{
        Icon: PersonIcon,
        title: `Beskjeder for ${sykmeldtName}`,
        subtitle: sykmeldt && fnrText(sykmeldt.fnr),
        subtitleSkeleton: !error,
      }}
      sykmeldt={sykmeldt}
      navigation={
        <PageSideMenu sykmeldt={sykmeldt} activePage={RootPages.Meldinger} />
      }
    >
      <Head>
        <title>Meldinger - Dine Sykmeldte - nav.no</title>
      </Head>
      {isLoading && <PageFallbackLoader text="Laster meldinger" />}
      {sykmeldt && (
        <MeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />
      )}
      {error && (
        <PageError
          text="Vi klarte ikke å laste meldingene"
          cause={error.message}
        />
      )}
    </PageContainer>
  );
};

export const getServerSideProps = withAuthenticatedPage();

export default MeldingerPage;
