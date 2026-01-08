import React, { ReactElement } from "react";
import Head from "next/head";
import { PersonIcon } from "@navikt/aksel-icons";
import { PageContainer, RootPages } from "@navikt/dinesykmeldte-sidemeny";
import { withAuthenticatedPage } from "../../../auth/withAuthentication";
import PageSideMenu from "../../../components/PageSideMenu/PageSideMenu";
import SoknaderInfo from "../../../components/SoknaderInfo/SoknaderInfo";
import PageError from "../../../components/shared/errors/PageError";
import SykmeldtNotFound from "../../../components/shared/errors/SykmeldtNotFound";
import PageFallbackLoader from "../../../components/shared/pagefallbackloader/PageFallbackLoader";
import SoknaderList from "../../../components/soknader/SoknaderList";
import {
  createSoknaderBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../hooks/useBreadcrumbs";
import useFocusRefetch from "../../../hooks/useFocusRefetch";
import { useSykmeldt } from "../../../hooks/useSykmeldt";
import { fnrText, formatNameSubjective } from "../../../utils/sykmeldtUtils";

function Soknader(): ReactElement {
  const { sykmeldtId, sykmeldt, isLoading, error, sykmeldtNotFound, refetch } =
    useSykmeldt();
  const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

  useFocusRefetch(refetch);
  useUpdateBreadcrumbs(
    () => createSoknaderBreadcrumbs(sykmeldtId, sykmeldt?.navn),
    [sykmeldt?.navn, sykmeldtId],
  );

  return (
    <PageContainer
      header={{
        Icon: PersonIcon,
        title: `Søknader for ${sykmeldtName}`,
        subtitle: sykmeldt && fnrText(sykmeldt.fnr),
        subtitleSkeleton: !error && !sykmeldtNotFound,
      }}
      sykmeldt={sykmeldt}
      navigation={
        !sykmeldtNotFound && (
          <PageSideMenu sykmeldt={sykmeldt} activePage={RootPages.Soknader} />
        )
      }
    >
      <Head>
        <title>Søknader - Dine Sykmeldte - nav.no</title>
      </Head>
      {isLoading && <PageFallbackLoader text="Laster søknader" />}
      {sykmeldt && <SoknaderList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
      {error && !sykmeldtNotFound && (
        <PageError
          text="Vi klarte ikke å laste søknadene"
          cause={error.message}
        />
      )}
      {sykmeldtNotFound && !error && <SykmeldtNotFound />}
      <SoknaderInfo />
    </PageContainer>
  );
}

export const getServerSideProps = withAuthenticatedPage();

export default Soknader;
