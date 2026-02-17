import { ExpansionCard } from "@navikt/ds-react";
import React, { type ReactElement } from "react";
import type { PreviewSykmeldtFragment } from "../../../../graphql/queries/graphql.generated";
import SykmeldtPeriodStatus from "../../SykmeldtPeriodStatus/SykmeldtPeriodStatus";
import SykmeldtIcon from "./SykmeldtIcon/SykmeldtIcon";

interface Props {
  sykmeldt: PreviewSykmeldtFragment;
  notification: boolean;
  notSentSoknad: boolean;
  notifyingText?: string;
  isHeadingLevel4: boolean;
}

function SykmeldtSummary({
  sykmeldt,
  notification,
  notSentSoknad,
  notifyingText,
  isHeadingLevel4,
}: Props): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div className="mr-2">
        <SykmeldtIcon
          sykmeldt={sykmeldt}
          notification={notification}
          notSentSoknad={notSentSoknad}
        />
      </div>
      <div>
        <ExpansionCard.Title as={isHeadingLevel4 ? "h4" : "h3"}>
          {sykmeldt.navn}
        </ExpansionCard.Title>
        <ExpansionCard.Description>
          {(notification || notSentSoknad) && notifyingText ? (
            <>{notifyingText}</>
          ) : (
            <SykmeldtPeriodStatus sykmeldt={sykmeldt} />
          )}
        </ExpansionCard.Description>
      </div>
    </div>
  );
}

export default SykmeldtSummary;
