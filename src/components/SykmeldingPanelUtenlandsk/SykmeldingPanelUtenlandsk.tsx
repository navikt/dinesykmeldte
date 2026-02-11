import React, { ReactElement } from "react";
import { PrinterSmallIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import { formatDate } from "../../utils/dateUtils";
import { cn } from "../../utils/tw-utils";
import { UtenlandskSykmelding } from "../../utils/utenlanskUtils";
import AnnenInfo from "../sykmeldingpanel/AnnenInfo";
import SykmeldingenGjelder from "../sykmeldingpanel/SykmeldingenGjelder";
import SykmeldingPeriode from "../sykmeldingpanel/sykmeldingperiode/SykmeldingPeriode";

interface Props {
  sykmelding: UtenlandskSykmelding;
}

function SykmeldingPanelUtenlandsk({ sykmelding }: Props): ReactElement {
  return (
    <section
      className="my-2 flex max-w-2xl flex-col gap-1"
      aria-labelledby="sykmeldinger-panel-info-section"
    >
      <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
        Opplysninger fra utenlandsk sykmelding
      </Heading>
      <div
        className={cn("flex justify-between", {
          "h-0 justify-end [&>button]:-top-10 [&>button]:h-8":
            !sykmelding.sendtTilArbeidsgiverDato,
        })}
      >
        {sykmelding.sendtTilArbeidsgiverDato && (
          <BodyShort className="text-ax-text-neutral-subtle mb-6" size="small">
            {`Sendt til deg ${formatDate(sykmelding.sendtTilArbeidsgiverDato)}`}
          </BodyShort>
        )}
        <Button
          onClick={() => {
            window.print();
          }}
          variant="tertiary"
          size="small"
          className="relative bottom-3 max-[720px]:hidden print:hidden"
          icon={<PrinterSmallIcon title="Lag PDF versjon av sykmeldingen" />}
        >
          Skriv ut
        </Button>
      </div>
      <ul className="list-none p-0">
        <SykmeldingenGjelder name={sykmelding.navn} fnr={sykmelding.fnr} />
        <SykmeldingPeriode perioder={sykmelding.perioder} />
        <AnnenInfo sykmelding={sykmelding} />
      </ul>
    </section>
  );
}

export default SykmeldingPanelUtenlandsk;
