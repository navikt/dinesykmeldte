import { ReactElement, useEffect, useRef } from "react";
import { BodyShort, ExpansionCard } from "@navikt/ds-react";
import {
  PreviewSoknadFragment,
  PreviewSykmeldtFragment,
} from "../../../graphql/queries/graphql.generated";
import { previewNySoknaderRead } from "../../../utils/soknadUtils";
import ExpandableSykmeldtPeriodSummary from "./ExpandableSykmeldtPeriodSummary/ExpandableSykmeldtPeriodSummary";
import { ManglerSoknadInfo } from "./ManglerSoknadInfo/ManglerSoknadInfo";
import SykmeldtContent from "./SykmeldtContent/SykmeldtContent";
import SykmeldtInfo from "./SykmeldtInfo/SykmeldtInfo";
import SykmeldtSummary from "./SykmeldtSummary/SykmeldtSummary";

interface Props {
  sykmeldt: PreviewSykmeldtFragment;
  expanded: boolean;
  periodsExpanded: boolean;
  onClick: (id: string, where: "root" | "periods") => void;
  notification: boolean;
  focusSykmeldtId: string | null;
  notifyingText?: string;
  isHeadingLevel4: boolean;
}

function ExpandableSykmeldtPanel({
  sykmeldt,
  expanded,
  periodsExpanded,
  onClick,
  notification,
  focusSykmeldtId,
  notifyingText,
  isHeadingLevel4,
}: Props): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusSykmeldtId !== sykmeldt.narmestelederId) return;

    ref.current?.focus();
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [focusSykmeldtId, sykmeldt.narmestelederId]);

  const nySoknaderReadWithWarning: PreviewSoknadFragment[] =
    previewNySoknaderRead(sykmeldt.previewSoknader);
  const notSentSoknaderWarning =
    !notification && nySoknaderReadWithWarning.length > 0;

  const headerId = `sykmeldt-accordion-header-${sykmeldt.narmestelederId}`;
  return (
    <ExpansionCard
      ref={ref}
      open={expanded}
      aria-labelledby={headerId}
      data-color={notification ? "info" : undefined}
    >
      <ExpansionCard.Header
        id={headerId}
        onClick={() => {
          onClick(sykmeldt.narmestelederId, "root");
        }}
      >
        <SykmeldtSummary
          sykmeldt={sykmeldt}
          notification={notification}
          notSentSoknad={notSentSoknaderWarning}
          notifyingText={notifyingText}
          isHeadingLevel4={isHeadingLevel4}
        />
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        {nySoknaderReadWithWarning.length > 0 && (
          <ManglerSoknadInfo
            name={sykmeldt.navn}
            soknader={nySoknaderReadWithWarning}
            sykmeldtId={sykmeldt.narmestelederId}
          />
        )}
        <ExpandableSykmeldtPeriodSummary
          onClick={onClick}
          expanded={periodsExpanded}
          previewSykmeldt={sykmeldt}
        />
        <SykmeldtInfo sykmeldt={sykmeldt} />
        <BodyShort className="mb-4" spacing size="small">
          Av personvernhensyn vises dokumentene inntil fire måneder etter at
          medarbeideren har blitt frisk. Du finner alle sykmeldinger i Altinn.
        </BodyShort>
        <SykmeldtContent sykmeldt={sykmeldt} notification={notification} />
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}

export default ExpandableSykmeldtPanel;
