import React, { ReactElement } from "react";
import { isPast } from "date-fns";
import { Tag } from "@navikt/ds-react";
import { PreviewSoknadFragment } from "../../../graphql/queries/graphql.generated";
import { formatDate } from "../../../utils/dateUtils";
import { getSoknadActivationDate } from "../../../utils/soknadUtils";

function SoknadTag({
  soknad,
}: {
  soknad: PreviewSoknadFragment;
}): ReactElement | null {
  switch (soknad.__typename) {
    case "PreviewNySoknad":
      if (!soknad.ikkeSendtSoknadVarsel) return null;

      return (
        <Tag data-color="info" variant="moderate" size="small">
          Ikke sendt
        </Tag>
      );
    case "PreviewFremtidigSoknad": {
      const soknadActivationDate = getSoknadActivationDate(soknad.tom);
      if (isPast(soknadActivationDate)) return null;

      return (
        <Tag data-color="info" variant="moderate" size="small">
          Aktiveres {formatDate(soknadActivationDate)}
        </Tag>
      );
    }
    case "PreviewSendtSoknad":
      if (!soknad.korrigererSoknadId) return null;

      return (
        <Tag data-color="info" variant="moderate" size="small">
          Korrigering
        </Tag>
      );
  }

  return null;
}

export default SoknadTag;
