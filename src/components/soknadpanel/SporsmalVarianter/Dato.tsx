import React, { ReactElement } from "react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { SoknadSporsmalSvartypeEnum } from "../../../graphql/queries/graphql.generated";
import { formatDate, formatMonthYear } from "../../../utils/dateUtils";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalList from "./shared/SporsmalList";
import SporsmalListItem from "./shared/SporsmalListItem";
import SporsmalListItemNested from "./shared/SporsmalListItemNested";

function Dato({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

  const listItemId = cleanId(sporsmal.id);

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} className="text-base" size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <SporsmalList>
        {sporsmal.svar.filter(notNull).map((svar) => {
          const svarId = cleanId(svar.verdi);
          const formattedDate =
            sporsmal.svartype === SoknadSporsmalSvartypeEnum.AarMaaned
              ? formatMonthYear(svar.verdi)
              : formatDate(svar.verdi);
          return (
            <SporsmalListItemNested key={svarId}>
              <BodyShort size="small">{formattedDate}</BodyShort>
            </SporsmalListItemNested>
          );
        })}
      </SporsmalList>
    </SporsmalListItem>
  );
}

export default Dato;
