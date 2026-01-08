import React, { ReactElement } from "react";
import { SoknadSporsmalFragment } from "../../../graphql/queries/graphql.generated";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import { PossibleSvarEnum, SporsmalVarianterProps } from "./SporsmalVarianter";
import Undersporsmal from "./Undersporsmal";
import SporsmalListItem from "./shared/SporsmalListItem";

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
