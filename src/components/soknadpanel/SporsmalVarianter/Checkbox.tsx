import React, { type ReactElement } from "react";
import type { SoknadSporsmalFragment } from "../../../graphql/queries/graphql.generated";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import {
  PossibleSvarEnum,
  type SporsmalVarianterProps,
} from "./SporsmalVarianter";
import SporsmalListItem from "./shared/SporsmalListItem";
import Undersporsmal from "./Undersporsmal";

function Checkbox({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  if (sporsmal.svar && sporsmal.svar[0]?.verdi !== PossibleSvarEnum.CHECKED)
    return null;

  const underspm = sporsmal.undersporsmal as SoknadSporsmalFragment[];
  const hasUndersporsmal = underspm.length > 0;

  return (
    <SporsmalListItem>
      {sporsmal.sporsmalstekst && (
        <CheckboxExplanation text={sporsmal.sporsmalstekst} alignStart />
      )}
      {hasUndersporsmal && <Undersporsmal sporsmalsliste={underspm} />}
    </SporsmalListItem>
  );
}

export default Checkbox;
