import { useMutation, useQuery } from "@apollo/client";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import { type ReactElement, useCallback, useEffect } from "react";
import { logAmplitudeEvent } from "../../amplitude/amplitude";
import {
  MarkSoknadReadDocument,
  MineSykmeldteDocument,
  type PreviewSoknadFragment,
  type PreviewSykmeldtFragment,
} from "../../graphql/queries/graphql.generated";
import { previewNySoknaderUnread } from "../../utils/soknadUtils";
import { formatNameSubjective } from "../../utils/sykmeldtUtils";
import { SectionListRoot } from "../shared/ListSection/ListSection";
import SoknaderVeilederInfo from "./SoknaderveilederInfo/SoknaderVeilederInfo";
import SoknaderListSection from "./soknaderlistsection/SoknaderListSection";

interface Props {
  sykmeldtId: string;
  sykmeldt: PreviewSykmeldtFragment;
}

function SoknaderList({ sykmeldtId, sykmeldt }: Props): ReactElement {
  const { ny, uleste, leste, fremtidig } = groupPreviewSoknader(
    sykmeldt.previewSoknader,
  );
  const noSoknader = sykmeldt.previewSoknader.length === 0;
  const { refetch, loading } = useQuery(MineSykmeldteDocument, {
    notifyOnNetworkStatusChange: true,
  });
  const [markSoknadRead, { loading: markSoknadReadLoading }] = useMutation(
    MarkSoknadReadDocument,
  );

  const markSoknaderRead = useCallback(
    async (soknadIds: string[]): Promise<void> => {
      await Promise.allSettled(
        soknadIds.map((soknadId) =>
          markSoknadRead({ variables: { soknadId } }),
        ),
      );

      await refetch();
    },
    [markSoknadRead, refetch],
  );

  useEffect(() => {
    const nySoknadUnreadWithWarning: PreviewSoknadFragment[] =
      previewNySoknaderUnread(sykmeldt.previewSoknader);

    if (nySoknadUnreadWithWarning.length > 0) {
      (async () => {
        await Promise.allSettled(
          nySoknadUnreadWithWarning.map((it) =>
            markSoknadRead({ variables: { soknadId: it.id } }),
          ),
        );
        await refetch();
      })();
    }
  }, [sykmeldt.previewSoknader, markSoknadRead, refetch]);

  return (
    <SectionListRoot>
      <SoknaderVeilederInfo name={sykmeldt.navn} unsentSoknad={ny.length > 0} />
      {noSoknader && <NoSoknaderMessage navn={sykmeldt.navn} />}
      <SoknaderListSection
        title="Uleste søknader"
        soknader={uleste}
        sykmeldtId={sykmeldtId}
        bonusAction={
          <Button
            variant="tertiary"
            size="small"
            onClick={() => {
              logAmplitudeEvent(
                {
                  eventName: "handling",
                  data: { navn: "marker alle søknader som lest" },
                },
                {
                  antall: uleste.length,
                },
              );
              return markSoknaderRead(uleste.map((it) => it.id));
            }}
            loading={loading || markSoknadReadLoading}
          >
            Marker alle som lest
          </Button>
        }
      />
      <SoknaderListSection
        title="Leste søknader"
        soknader={leste}
        sykmeldtId={sykmeldtId}
      />
      <SoknaderListSection
        title="Planlagte søknader"
        soknader={fremtidig}
        sykmeldtId={sykmeldtId}
      />
      <SoknaderListSection
        title="Til utfylling"
        soknader={ny}
        sykmeldtId={sykmeldtId}
      />
    </SectionListRoot>
  );
}

function NoSoknaderMessage({ navn }: { navn: string }): ReactElement {
  return (
    <div>
      <Heading size="medium" level="2">
        Nye søknader
      </Heading>
      <BodyShort>
        Du har ikke mottatt noen søknader fra {formatNameSubjective(navn)}.
      </BodyShort>
    </div>
  );
}

const byTypeName =
  (typeName: PreviewSoknadFragment["__typename"]) =>
  (soknad: PreviewSoknadFragment) =>
    soknad.__typename === typeName;

function groupPreviewSoknader(previewSoknader: PreviewSoknadFragment[]): {
  ny: PreviewSoknadFragment[];
  fremtidig: PreviewSoknadFragment[];
  uleste: PreviewSoknadFragment[];
  leste: PreviewSoknadFragment[];
} {
  return {
    ny: previewSoknader.filter(byTypeName("PreviewNySoknad")),
    fremtidig: previewSoknader.filter(byTypeName("PreviewFremtidigSoknad")),
    uleste: previewSoknader.filter(
      (it) => it.__typename === "PreviewSendtSoknad" && !it.lest,
    ),
    leste: previewSoknader.filter(
      (it) => it.__typename === "PreviewSendtSoknad" && it.lest,
    ),
  };
}

export default SoknaderList;
