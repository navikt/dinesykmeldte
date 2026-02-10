import React, { ReactElement } from "react";
import { PrinterSmallIcon } from "@navikt/aksel-icons";
import { TasklistIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import { SoknadFragment } from "../../graphql/queries/graphql.generated";
import { formatDate } from "../../utils/dateUtils";
import { cleanId } from "../../utils/stringUtils";
import { IconHeading } from "../shared/IconHeading/IconHeading";
import SoknadPerioder from "./SoknadPerioder";
import SoknadenGjelder from "./SoknadenGjelder";
import { SporsmalVarianter } from "./SporsmalVarianter/SporsmalVarianter";

interface Props {
  soknad: SoknadFragment;
}

const title = "Spørsmål fra søknaden";

function SoknadPanel({ soknad }: Props): ReactElement {
  const listItemId = cleanId(title);

  return (
    <section
      className="my-2 mb-10 flex max-w-2xl flex-col gap-1 print:m-0"
      aria-labelledby="soknad-oppsummering-section"
    >
      <Heading id="soknad-oppsummering-section" size="medium" level="2">
        Oppsummering fra søknaden
      </Heading>
      <div className="flex justify-between">
        <BodyShort className="text-ax-text-neutral-subtle mb-6" size="small">
          {`Sendt til deg ${formatDate(soknad.sendtDato)}`}
        </BodyShort>
        <Button
          onClick={() => {
            window.print();
          }}
          variant="tertiary"
          size="small"
          className="relative bottom-3 max-[720px]:hidden print:hidden"
          icon={<PrinterSmallIcon title="Skriv ut søknaden" />}
        >
          Skriv ut
        </Button>
      </div>
      <ul className="list-none p-0">
        <SoknadenGjelder name={soknad.navn} fnr={soknad.fnr} />
        <SoknadPerioder perioder={soknad.perioder} />
        <li aria-labelledby={listItemId}>
          <IconHeading
            title="Spørsmål fra søknaden"
            headingId={listItemId}
            Icon={TasklistIcon}
          />
          <ul>
            {soknad.sporsmal.map((sporsmal) => {
              return (
                <SporsmalVarianter key={sporsmal.id} sporsmal={sporsmal} />
              );
            })}
          </ul>
        </li>
      </ul>
    </section>
  );
}

export default SoknadPanel;
