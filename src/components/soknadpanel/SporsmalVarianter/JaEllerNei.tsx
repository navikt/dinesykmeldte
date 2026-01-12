import React, { ReactElement } from "react";
import { Heading } from "@navikt/ds-react";
import { SoknadSporsmalFragment } from "../../../graphql/queries/graphql.generated";
import { capitalizeFirstLetterOnly, cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import { SporsmalVarianterProps } from "./SporsmalVarianter";
import Undersporsmal from "./Undersporsmal";
import SporsmalListItem from "./shared/SporsmalListItem";

const erUndersporsmalStilt = (sporsmal: SoknadSporsmalFragment): boolean => {
  if (
    sporsmal.svar &&
    sporsmal.svar.length > 0 &&
    sporsmal.kriterieForVisningAvUndersporsmal
  ) {
    return (
      sporsmal.svar
        .filter(notNull)
        .map((svar) => svar.verdi)
        .indexOf(sporsmal.kriterieForVisningAvUndersporsmal) > -1
    );
  }
  return false;
};

function JaEllerNei({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.svar || !sporsmal.svar[0]) return null;

  const listItemId = cleanId(sporsmal.id);
  const undersporsmal = sporsmal.undersporsmal as SoknadSporsmalFragment[];

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} className="text-base" size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <CheckboxExplanation
        text={capitalizeFirstLetterOnly(sporsmal.svar[0].verdi)}
      />
      {erUndersporsmalStilt(sporsmal) && (
        <Undersporsmal sporsmalsliste={undersporsmal} />
      )}
    </SporsmalListItem>
  );
}

export default JaEllerNei;
