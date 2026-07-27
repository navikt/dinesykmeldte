"use client";

import { PersonIcon } from "@navikt/aksel-icons";
import { PageContainer, RootPages } from "@navikt/dinesykmeldte-sidemeny";
import type { ReactElement } from "react";
import MeldingerList from "../../../../components/meldinger/MeldingerList";
import PageSideMenu from "../../../../components/PageSideMenu/PageSideMenu";
import PageError from "../../../../components/shared/errors/PageError";
import ListSectionSkeleton from "../../../../components/shared/skeletons/ListSectionSkeleton";
import SkeletonRegion from "../../../../components/shared/skeletons/SkeletonRegion";
import {
  createMeldingerBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../../hooks/useBreadcrumbs";
import useFocusRefetch from "../../../../hooks/useFocusRefetch";
import { useSykmeldt } from "../../../../hooks/useSykmeldt";
import { fnrText, formatNameSubjective } from "../../../../utils/sykmeldtUtils";

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
      {isLoading && !sykmeldt && (
        <SkeletonRegion loadingText="Laster meldinger">
          <ListSectionSkeleton />
        </SkeletonRegion>
      )}
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

export default MeldingerPage;
