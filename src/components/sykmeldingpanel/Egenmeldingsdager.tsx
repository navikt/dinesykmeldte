import React, { ReactElement } from "react";
import { PersonPencilIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, BodyShort } from "@navikt/ds-react";
import { formatDate } from "../../utils/dateUtils";
import { cleanId } from "../../utils/stringUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";

interface Props {
  egenmeldingsdager?: string[] | null | undefined;
}

const title = "Egenmeldingsdager";

function Egenmeldingsdager({ egenmeldingsdager }: Props): ReactElement {
  return (
    <>
      <EgenmeldingsdagerList egenmeldingsdager={egenmeldingsdager} />
      <li>
        <Alert className="mt-2 mb-4 print:hidden" variant="info">
          <BodyLong size="small">
            Over finner du nå informasjon om den ansatte brukte egenmelding før
            sykmeldingsperioden.
          </BodyLong>
        </Alert>
      </li>
    </>
  );
}

function EgenmeldingsdagerList({
  egenmeldingsdager,
}: Props): ReactElement | null {
  const listItemId = cleanId(title);

  return (
    <li className="pb-4" aria-labelledby={listItemId}>
      <IconHeading
        title={title}
        headingId={listItemId}
        Icon={PersonPencilIcon}
      />
      {egenmeldingsdager != null ? (
        <div className="bg-ax-bg-neutral-soft rounded px-7 py-5 print:py-0">
          <ul className="list-none p-0">
            {egenmeldingsdager?.map((dag: string) => (
              <BodyShort
                key={formatDate(dag)}
                className="mb-1"
                as="li"
                size="small"
              >
                {formatDate(dag)}
              </BodyShort>
            ))}
          </ul>
          <BodyShort size="small">
            {`(${egenmeldingsdager?.length} ${egenmeldingsdager?.length === 1 ? "dag" : "dager"})`}
          </BodyShort>
        </div>
      ) : (
        <BodyShort
          className="bg-ax-bg-neutral-soft rounded px-7 py-5 print:py-0"
          size="small"
        >
          Ingen dager valgt.
        </BodyShort>
      )}
    </li>
  );
}

export default Egenmeldingsdager;
