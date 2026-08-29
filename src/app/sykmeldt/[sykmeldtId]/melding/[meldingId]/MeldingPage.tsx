"use client";

import { useMutation } from "@apollo/client";
import { PersonIcon } from "@navikt/aksel-icons";
import { ChildPages, PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import { logger } from "@navikt/next-logger";
import { type ReactElement, useEffect } from "react";
import Aktivitet from "../../../../../components/meldinger/Aktitiet/Aktivitet";
import PageSideMenu from "../../../../../components/PageSideMenu/PageSideMenu";
import {
  MarkAktivitetvarselReadDocument,
  MineSykmeldteDocument,
} from "../../../../../graphql/queries/graphql.generated";
import {
  createMeldingBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../../../hooks/useBreadcrumbs";
import useParam, { RouteLocation } from "../../../../../hooks/useParam";
import { useSykmeldt } from "../../../../../hooks/useSykmeldt";
import { reportClientErrorUnlessHandledByApollo } from "../../../../../observability/apolloErrorOwnership";
import {
  fnrText,
  formatNameSubjective,
} from "../../../../../utils/sykmeldtUtils";

const MeldingPage = (): ReactElement => {
  const { sykmeldt, error } = useSykmeldt();
  const { sykmeldtId, meldingId } = useParam(RouteLocation.Melding);
  const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

  useMarkRead(meldingId);
  useUpdateBreadcrumbs(
    () => createMeldingBreadcrumbs(sykmeldtId, sykmeldt?.navn),
    [sykmeldtId, sykmeldt?.navn],
  );

  return (
    <PageContainer
      header={{
        Icon: PersonIcon,
        title: `Aktivitetsvarsel for ${sykmeldtName}`,
        subtitle: sykmeldt && fnrText(sykmeldt.fnr),
        subtitleSkeleton: !error,
      }}
      sykmeldt={sykmeldt}
      navigation={
        <PageSideMenu sykmeldt={sykmeldt} activePage={ChildPages.Melding} />
      }
    >
      <Aktivitet sykmeldtId={sykmeldtId} />
    </PageContainer>
  );
};

function useMarkRead(aktivitetsvarselId: string): void {
  const [mutate] = useMutation(MarkAktivitetvarselReadDocument);

  useEffect(() => {
    (async () => {
      try {
        await mutate({
          variables: { aktivitetsvarselId },
          refetchQueries: [{ query: MineSykmeldteDocument }],
        });
        logger.info(
          `Client: Marked aktivitetsvarsel with id ${aktivitetsvarselId} as read`,
        );
      } catch (error) {
        reportClientErrorUnlessHandledByApollo(
          error,
          "Unable to mark aktivitetsvarsel as read",
        );
        return;
      }
    })();
  }, [mutate, aktivitetsvarselId]);
}

export default MeldingPage;
