import React, { ReactElement } from "react";
import { PreviewSykmeldtFragment } from "../../../graphql/queries/graphql.generated";
import { formatPeriodsRelative } from "../../../utils/sykmeldingPeriodUtils";
import { notNull } from "../../../utils/tsUtils";

function SykmeldtPeriodStatus({
  sykmeldt,
}: {
  sykmeldt: PreviewSykmeldtFragment;
}): ReactElement {
  return (
    <span>
      {formatPeriodsRelative(sykmeldt.sykmeldinger.filter(notNull)).text}
    </span>
  );
}

export default SykmeldtPeriodStatus;
