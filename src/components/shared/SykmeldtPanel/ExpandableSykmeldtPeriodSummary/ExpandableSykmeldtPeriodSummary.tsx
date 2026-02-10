import { ReactElement } from "react";
import { ClockDashedIcon } from "@navikt/aksel-icons";
import { ExpansionCard } from "@navikt/ds-react";
import { PreviewSykmeldtFragment } from "../../../../graphql/queries/graphql.generated";
import { periodByDateAsc } from "../../../../utils/sykmeldingPeriodUtils";
import { formatFirstNamePossessive } from "../../../../utils/sykmeldtUtils";
import { notNull } from "../../../../utils/tsUtils";
import PeriodSummaryTable from "./PeriodSummary/PeriodSummaryTable";

interface Props {
  expanded: boolean;
  onClick: (id: string, where: "periods") => void;
  previewSykmeldt: PreviewSykmeldtFragment;
}

function ExpandableSykmeldtPeriodSummary({
  expanded,
  onClick,
  previewSykmeldt,
}: Props): ReactElement {
  return (
    <ExpansionCard
      open={expanded}
      size="small"
      className="bg-ax-bg-default mb-4"
      aria-label={formatFirstNamePossessive(
        previewSykmeldt.navn,
        "sykmeldingshistorikk",
      )}
    >
      <ExpansionCard.Header
        id={`sykmeldt-perioder-accordion-header-${previewSykmeldt.narmestelederId}`}
        onClick={() => {
          onClick(previewSykmeldt.narmestelederId, "periods");
        }}
      >
        <div className="flex items-center">
          <ClockDashedIcon
            className="text-deepblue-400 mr-2 text-2xl"
            role="img"
            aria-hidden
          />
          <ExpansionCard.Title
            className="max-[366px]:text-base"
            as="h5"
            size="small"
          >
            {formatFirstNamePossessive(
              previewSykmeldt.navn,
              "sykmeldingshistorikk",
            )}
          </ExpansionCard.Title>
        </div>
      </ExpansionCard.Header>
      <ExpansionCard.Content className="max-[430px]:overflow-auto max-[430px]:whitespace-nowrap">
        <PeriodSummaryTable
          perioder={previewSykmeldt.sykmeldinger
            ?.flatMap((it) => it?.perioder)
            .filter(notNull)
            .sort(periodByDateAsc)}
        />
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}

export default ExpandableSykmeldtPeriodSummary;
