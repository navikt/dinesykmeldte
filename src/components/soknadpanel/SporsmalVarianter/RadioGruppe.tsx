import React, { ReactElement } from "react";
import { Heading } from "@navikt/ds-react";
import {
  SoknadSporsmalFragment,
  SoknadSporsmalSvartypeEnum,
} from "../../../graphql/queries/graphql.generated";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import { PossibleSvarEnum, SporsmalVarianterProps } from "./SporsmalVarianter";
import Undersporsmal from "./Undersporsmal";
import SporsmalListItem from "./shared/SporsmalListItem";

function RadioGruppe({
  sporsmal,
}: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.undersporsmal || sporsmal.undersporsmal.length === 0)
    return null;

  const listItemId = cleanId(sporsmal.id);

  const besvartUndersporsmal = sporsmal.undersporsmal
    .filter(notNull)
    .find((underspm) => {
      return (
        underspm.svar &&
        underspm.svar[0] &&
        underspm.svar[0].verdi === PossibleSvarEnum.CHECKED
      );
    });

  if (!besvartUndersporsmal) return null;

  const besvartUnderspm =
    besvartUndersporsmal.undersporsmal as SoknadSporsmalFragment[];
  const hasBesvartUnderspm = besvartUnderspm && besvartUnderspm.length > 0;

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      {besvartUndersporsmal.sporsmalstekst &&
        sporsmal.svartype === SoknadSporsmalSvartypeEnum.RadioGruppe && (
          <CheckboxExplanation text={besvartUndersporsmal.sporsmalstekst} />
        )}
      {hasBesvartUnderspm && <Undersporsmal sporsmalsliste={besvartUnderspm} />}
    </SporsmalListItem>
  );
}

export default RadioGruppe;
