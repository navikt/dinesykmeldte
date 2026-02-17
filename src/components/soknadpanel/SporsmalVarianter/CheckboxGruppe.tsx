import { Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { SoknadSporsmalFragment } from "../../../graphql/queries/graphql.generated";
import { cleanId } from "../../../utils/stringUtils";
import type { SporsmalVarianterProps } from "./SporsmalVarianter";
import Undersporsmal from "./Undersporsmal";

function CheckboxGruppe({
  sporsmal,
}: SporsmalVarianterProps): ReactElement | null {
  const undersporsmal = sporsmal.undersporsmal as SoknadSporsmalFragment[];

  if (!undersporsmal || undersporsmal?.length === 0) return null;

  const listItemId = cleanId(sporsmal.id);

  return (
    <li aria-labelledby={listItemId}>
      <Heading id={listItemId} size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <Undersporsmal sporsmalsliste={undersporsmal} />
    </li>
  );
}

export default CheckboxGruppe;
