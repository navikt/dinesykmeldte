import { BodyShort, Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { z } from "zod";
import { DateSchema } from "../../../services/minesykmeldte/schema/common";
import { formatDateRange } from "../../../utils/dateUtils";
import { cleanId } from "../../../utils/stringUtils";
import { notNull } from "../../../utils/tsUtils";
import type { SporsmalVarianterProps } from "./SporsmalVarianter";
import SporsmalList from "./shared/SporsmalList";
import SporsmalListItem from "./shared/SporsmalListItem";
import SporsmalListItemNested from "./shared/SporsmalListItemNested";

const PeriodeSvarSchema = z.object({
  fom: DateSchema,
  tom: DateSchema,
});

function Periode({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
  if (!sporsmal.svar || sporsmal.svar.length === 0) return null;

  const listItemId = cleanId(sporsmal.id);

  return (
    <SporsmalListItem listItemId={listItemId}>
      <Heading id={listItemId} size="xsmall" level="4">
        {sporsmal.sporsmalstekst}
      </Heading>
      <SporsmalList>
        {sporsmal.svar.filter(notNull).map((svar) => {
          const svarId = cleanId(svar.verdi);
          const dates = PeriodeSvarSchema.parse(JSON.parse(svar.verdi));
          return (
            <SporsmalListItemNested key={svarId}>
              <BodyShort size="small">
                {formatDateRange(dates.fom, dates.tom)}
              </BodyShort>
            </SporsmalListItemNested>
          );
        })}
      </SporsmalList>
    </SporsmalListItem>
  );
}

export default Periode;
