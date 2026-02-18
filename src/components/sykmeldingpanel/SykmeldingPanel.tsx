import { PrinterSmallIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import { formatDate } from "../../utils/dateUtils";
import { cn } from "../../utils/tw-utils";
import AnnenInfo from "./AnnenInfo";
import Arbeidsevne from "./Arbeidsevne";
import Egenmeldingsdager from "./Egenmeldingsdager";
import FriskmeldingPrognose from "./FriskmeldingPrognose";
import MeldingTilArbeidsgiver from "./MeldingTilArbeidsgiver";
import MulighetForArbeidList from "./MulighetForArbeidList";
import SykmeldingenGjelder from "./SykmeldingenGjelder";
import SykmeldingPeriode from "./sykmeldingperiode/SykmeldingPeriode";
import Tilbakedatering from "./Tilbakedatering";

interface Props {
  sykmelding: SykmeldingFragment;
}

function SykmeldingPanel({ sykmelding }: Props): ReactElement {
  return (
    <section
      className="my-2 flex max-w-2xl flex-col gap-1"
      aria-labelledby="sykmeldinger-panel-info-section"
    >
      <Heading size="medium" level="2" id="sykmeldinger-panel-info-section">
        Opplysninger fra sykmeldingen
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
          icon={<PrinterSmallIcon title="Skriv ut sykmeldingen" />}
        >
          Skriv ut
        </Button>
      </div>
      <ul className="list-none p-0">
        <SykmeldingenGjelder name={sykmelding.navn} fnr={sykmelding.fnr} />
        <SykmeldingPeriode perioder={sykmelding.perioder} />
        <Egenmeldingsdager egenmeldingsdager={sykmelding.egenmeldingsdager} />
        <AnnenInfo sykmelding={sykmelding} />
        <MulighetForArbeidList sykmelding={sykmelding} />
        <FriskmeldingPrognose sykmelding={sykmelding} />
        <Arbeidsevne tiltakArbeidsplassen={sykmelding.tiltakArbeidsplassen} />
        <MeldingTilArbeidsgiver sykmelding={sykmelding} />
        <Tilbakedatering kontaktDato={sykmelding.kontaktDato} />
      </ul>
    </section>
  );
}

export default SykmeldingPanel;
