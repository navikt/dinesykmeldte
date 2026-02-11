import React, { ReactElement, useCallback } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "@apollo/client";
import { partition } from "remeda";
import { BandageIcon } from "@navikt/aksel-icons";
import { Button, HGrid } from "@navikt/ds-react";
import { logAmplitudeEvent } from "../../amplitude/amplitude";
import {
  MarkSykmeldingReadDocument,
  MineSykmeldteDocument,
  PreviewSykmeldtFragment,
  SykmeldingFragment,
} from "../../graphql/queries/graphql.generated";
import { formatDateRange } from "../../utils/dateUtils";
import {
  getEarliestFom,
  getLatestTom,
  getSykmeldingPeriodDescription,
} from "../../utils/sykmeldingPeriodUtils";
import { sykmeldingByDateDesc } from "../../utils/sykmeldingUtils";
import { formatNameSubjective } from "../../utils/sykmeldtUtils";
import { isUtenlandsk } from "../../utils/utenlanskUtils";
import ListSection, {
  SectionListRoot,
} from "../shared/ListSection/ListSection";
import LinkPanel from "../shared/links/LinkPanel";

const DialogmoteSykmeldingerInfoPanel = dynamic(
  () => import("../DialogmoteInfoPanel/DialogmoteSykmeldingerInfoPanel"),
  { ssr: false },
);

interface Props {
  sykmeldtId: string;
  sykmeldt: PreviewSykmeldtFragment;
}

function SykmeldingerList({ sykmeldtId, sykmeldt }: Props): ReactElement {
  const { refetch, loading } = useQuery(MineSykmeldteDocument, {
    notifyOnNetworkStatusChange: true,
  });
  const [markSykmeldingRead, { loading: markSykmeldingReadLoading }] =
    useMutation(MarkSykmeldingReadDocument, {});
  const [readSykmeldinger, unreadSykmeldinger] = partition(
    sykmeldt.sykmeldinger,
    (it) => it.lest,
  );

  const hasUnread = unreadSykmeldinger.length > 0;
  const hasRead = readSykmeldinger.length > 0;

  const markSykmeldingerRead = useCallback(
    async (ids: string[]): Promise<void> => {
      await Promise.allSettled(
        ids.map((id) =>
          markSykmeldingRead({ variables: { sykmeldingId: id } }),
        ),
      );
      await refetch();
    },
    [markSykmeldingRead, refetch],
  );

  return (
    <SectionListRoot>
      {!hasRead && !hasUnread && (
        <div>
          Vi fant ingen sykmeldinger for {formatNameSubjective(sykmeldt.navn)}.
        </div>
      )}
      {hasUnread && (
        <ListSection
          id="sykmeldinger-list-uleste-header"
          title="Uleste"
          bonusAction={
            <Button
              variant="tertiary"
              size="small"
              onClick={() => {
                logAmplitudeEvent(
                  {
                    eventName: "handling",
                    data: { navn: "marker alle sykmeldinger som lest" },
                  },
                  {
                    antall: unreadSykmeldinger.length,
                  },
                );
                return markSykmeldingerRead(
                  unreadSykmeldinger.map((it) => it.id),
                );
              }}
              loading={loading || markSykmeldingReadLoading}
            >
              Marker alle som lest
            </Button>
          }
        >
          <HGrid gap="space-24">
            {unreadSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
              const earliestFom = getEarliestFom(it);
              const latestTom = getLatestTom(it);
              return (
                <div key={it.id}>
                  <LinkPanel
                    href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                    Icon={BandageIcon}
                    detail={formatDateRange(earliestFom, latestTom)}
                    description={<SykmeldingDescription sykmelding={it} />}
                    notify
                  >
                    {isUtenlandsk(it) ? "Utenlandsk sykmelding" : "Sykmelding"}
                  </LinkPanel>
                </div>
              );
            })}
          </HGrid>
        </ListSection>
      )}
      {(hasRead || hasUnread) && (
        <DialogmoteSykmeldingerInfoPanel
          sykmeldtId={sykmeldtId}
          name={sykmeldt.navn}
        />
      )}
      {hasRead && (
        <ListSection id="sykmeldinger-list-leste-header" title="Leste">
          <HGrid gap="space-24">
            {readSykmeldinger.sort(sykmeldingByDateDesc).map((it) => {
              const earliestFom = getEarliestFom(it);
              const latestTom = getLatestTom(it);
              return (
                <div key={it.id}>
                  <LinkPanel
                    href={`/sykmeldt/${sykmeldtId}/sykmelding/${it.id}`}
                    Icon={BandageIcon}
                    detail={formatDateRange(earliestFom, latestTom)}
                    description={<SykmeldingDescription sykmelding={it} />}
                  >
                    {isUtenlandsk(it) ? "Utenlandsk sykmelding" : "Sykmelding"}
                  </LinkPanel>
                </div>
              );
            })}
          </HGrid>
        </ListSection>
      )}
    </SectionListRoot>
  );
}

function SykmeldingDescription({
  sykmelding,
}: {
  sykmelding: SykmeldingFragment;
}): ReactElement {
  return (
    <div>
      {sykmelding.perioder
        .map((it) => getSykmeldingPeriodDescription(it))
        .join(", ")}
    </div>
  );
}

export default SykmeldingerList;
