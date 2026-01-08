import React, { ReactElement } from "react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { SoknadSporsmalSvarFragment } from "../../../graphql/queries/graphql.generated";
import { formatDate, formatDatePeriod } from "../../../utils/dateUtils";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import CheckboxExplanation from "../../shared/checkboxexplanation/CheckboxExplanation";
import { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalList from "./shared/SporsmalList";
import SporsmalListItem from "./shared/SporsmalListItem";
import SporsmalListItemNested from "./shared/SporsmalListItemNested";

const datoEllerIkkeTilBehandling = (
  svar: SoknadSporsmalSvarFragment,
): string => {
  if (svar.verdi === "" || svar.verdi === "Ikke til behandling") {
    return "Ikke til behandling";
  }
  return formatDate(svar.verdi);
};

function Behandlingsdager({
  sporsmal,
}: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.undersporsmal || sporsmal.undersporsmal?.length === 0)
    return null;

  const listItemId = cleanId(sporsmal.id);

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} className="text-base" size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <SporsmalList>
        {sporsmal.undersporsmal.filter(notNull).map((underspm) => {
          const undersporsmalId = cleanId(underspm.id);
          return (
            <SporsmalListItemNested
              listItemId={undersporsmalId}
              key={undersporsmalId}
            >
              {underspm.min && underspm.max && (
                <BodyShort id={undersporsmalId} size="small">
                  {formatDatePeriod(underspm.min, underspm.max)}
                </BodyShort>
              )}
              {underspm.svar && underspm.svar[0] && (
                <CheckboxExplanation
                  text={datoEllerIkkeTilBehandling(underspm.svar[0])}
                />
              )}
            </SporsmalListItemNested>
          );
        })}
      </SporsmalList>
    </SporsmalListItem>
  );
}

export default Behandlingsdager;
