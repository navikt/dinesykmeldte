import React, { ReactElement } from "react";
import { CalendarIcon } from "@navikt/aksel-icons";
import { BodyShort } from "@navikt/ds-react";
import { SykmeldingPeriodeFragment } from "../../../graphql/queries/graphql.generated";
import { formatDatePeriod } from "../../../utils/dateUtils";
import { cleanId } from "../../../utils/stringUtils";
import {
  getPeriodTitle,
  getReadableLength,
} from "../../../utils/sykmeldingPeriodUtils";
import { IconHeading } from "../../shared/IconHeading/IconHeading";

interface Props {
  perioder: SykmeldingPeriodeFragment[];
}

const title = "Sykmeldingsperioder (f.o.m. - t.o.m.)";

function SykmeldingPeriode({ perioder }: Props): ReactElement {
  const listItemId = cleanId(title);

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading title={title} headingId={listItemId} Icon={CalendarIcon} />
      <ul className="rounded bg-gray-50 px-7 py-5 print:py-0">
        {perioder.map((periode: SykmeldingPeriodeFragment) => (
          <li
            key={formatDatePeriod(periode.fom, periode.tom)}
            className="[&:not(:last-of-type)]:mb-6"
            aria-labelledby={cleanId(
              formatDatePeriod(periode.fom, periode.tom),
            )}
          >
            <div id={cleanId(formatDatePeriod(periode.fom, periode.tom))}>
              <BodyShort size="small" className="font-semibold">
                {getPeriodTitle(periode)}{" "}
                {formatDatePeriod(periode.fom, periode.tom)}
              </BodyShort>
              <BodyShort className="[&:not(:last-of-type)]:mb-1" size="small">
                {getReadableLength(periode)}
              </BodyShort>
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default SykmeldingPeriode;
