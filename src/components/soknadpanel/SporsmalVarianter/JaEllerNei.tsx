import { Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { SoknadSporsmalFragment } from "../../../graphql/queries/graphql.generated";
import { capitalizeFirstLetterOnly, cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import type { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalListItem from "./shared/SporsmalListItem";
import Undersporsmal from "./Undersporsmal";

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
      <Heading id={listItemId} size="xsmall" level="4">
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
