import React, { ReactElement } from "react";
import { BodyShort, Heading } from "@navikt/ds-react";
import { SoknadSporsmalSvartypeEnum } from "../../../graphql/queries/graphql.generated";
import { getSoknadTallLabel } from "../../../utils/soknadUtils";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalList from "./shared/SporsmalList";
import SporsmalListItem from "./shared/SporsmalListItem";
import SporsmalListItemNested from "./shared/SporsmalListItemNested";

function Tall({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.svar || !sporsmal.svar[0]) return null;

  const listItemId = cleanId(sporsmal.id);
  const label = getSoknadTallLabel(sporsmal) || sporsmal.undertekst;

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <SporsmalList>
        {sporsmal.svar.filter(notNull).map((svar) => {
          const svarId = cleanId(svar.verdi);
          let verdi = svar.verdi;

          if (sporsmal.svartype === SoknadSporsmalSvartypeEnum.Belop) {
            verdi = (Number(svar.verdi) / 100).toString();
          }
          return (
            <SporsmalListItemNested listItemId={svarId} key={svarId}>
              <BodyShort id={svarId} size="small">
                {verdi} {label}
              </BodyShort>
            </SporsmalListItemNested>
          );
        })}
      </SporsmalList>
    </SporsmalListItem>
  );
}

export default Tall;
