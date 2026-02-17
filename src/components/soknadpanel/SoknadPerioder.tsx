import { CalendarIcon } from "@navikt/aksel-icons";
import { BodyShort } from "@navikt/ds-react";
import React, { type ReactElement } from "react";
import type { SoknadperiodeFragment } from "../../graphql/queries/graphql.generated";
import { formatDatePeriod } from "../../utils/dateUtils";
import { getSoknadSykmeldingPeriodDescription } from "../../utils/soknadUtils";
import { cleanId } from "../../utils/stringUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";

interface Props {
  perioder: SoknadperiodeFragment[];
}

const title = "Perioden det gjelder (f.o.m. - t.o.m.)";

function SoknadPerioder({ perioder }: Props): ReactElement {
  const listItemId = cleanId(title);

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading title={title} headingId={listItemId} Icon={CalendarIcon} />
      <ul className="bg-ax-bg-neutral-soft rounded px-7 py-5 print:py-0">
        {perioder.map((periode: SoknadperiodeFragment) => (
          <li
            key={formatDatePeriod(periode.fom, periode.tom)}
            className="[&:not(:last-of-type)]:mb-6"
            aria-labelledby={cleanId(
              formatDatePeriod(periode.fom, periode.tom),
            )}
          >
            <div id={cleanId(formatDatePeriod(periode.fom, periode.tom))}>
              <BodyShort size="small" className="font-semibold">
                {formatDatePeriod(periode.fom, periode.tom)}
              </BodyShort>
              <BodyShort size="small">
                {getSoknadSykmeldingPeriodDescription(periode)}
              </BodyShort>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default SoknadPerioder;
