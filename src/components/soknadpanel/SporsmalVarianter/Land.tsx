import { BodyShort, Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import type { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalList from "./shared/SporsmalList";
import SporsmalListItem from "./shared/SporsmalListItem";
import SporsmalListItemNested from "./shared/SporsmalListItemNested";

function Land({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  const listItemId = cleanId(sporsmal.id);

  if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <SporsmalList>
        {sporsmal.svar.filter(notNull).map((svar) => {
          const svarId = cleanId(svar.verdi);
          return (
            <SporsmalListItemNested key={svarId}>
              <BodyShort size="small">{svar.verdi}</BodyShort>
            </SporsmalListItemNested>
          );
        })}
      </SporsmalList>
    </SporsmalListItem>
  );
}

export default Land;
