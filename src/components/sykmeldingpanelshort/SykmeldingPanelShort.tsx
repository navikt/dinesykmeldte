import { useQuery } from "@apollo/client";
import { BodyShort, Heading } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { SykmeldingByIdDocument } from "../../graphql/queries/graphql.generated";
import { formatDate } from "../../utils/dateUtils";
import { isUtenlandsk } from "../../utils/utenlanskUtils";
import PageError from "../shared/errors/PageError";
import PageFallbackLoader from "../shared/pagefallbackloader/PageFallbackLoader";
import SykmeldingenGjelder from "../sykmeldingpanel/SykmeldingenGjelder";
import SykmeldingPeriode from "../sykmeldingpanel/sykmeldingperiode/SykmeldingPeriode";
import AnnenInfoShort from "./AnnenInfoShort";

interface Props {
  sykmeldingId: string;
}

function SykmeldingPanelShort({ sykmeldingId }: Props): ReactElement {
  const { data, loading, error } = useQuery(SykmeldingByIdDocument, {
    variables: { sykmeldingId },
  });

  if (loading) return <PageFallbackLoader text="Laster sykmelding" />;
  if (error || !data?.sykmelding)
    return (
      <PageError
        text="Klarte ikke å laste søknadens sykmelding"
        cause={error?.message ?? "unknown (sykmelding panel)"}
      />
    );

  return (
    <section
      className="max-w-2xl"
      aria-labelledby="sykmeldinger-panel-info-section"
    >
      <div>
        <Heading
          className="mb-1"
          size="medium"
          level="2"
          id="sykmeldinger-panel-info-section"
        >
          {isUtenlandsk(data.sykmelding)
            ? "Opplysninger fra utenlandsk sykmelding"
            : "Opplysninger fra sykmeldingen"}
        </Heading>
        {data.sykmelding.sendtTilArbeidsgiverDato && (
          <BodyShort className="text-ax-text-neutral-subtle mb-4" size="small">
            {`Sendt til deg ${formatDate(data.sykmelding.sendtTilArbeidsgiverDato)}`}
          </BodyShort>
        )}
      </div>
      <ul className="m-0 list-none p-0">
        <SykmeldingenGjelder
          name={data.sykmelding.navn}
          fnr={data.sykmelding.fnr}
        />
        <SykmeldingPeriode perioder={data.sykmelding.perioder} />
        <AnnenInfoShort sykmelding={data.sykmelding} />
      </ul>
    </section>
  );
}

export default SykmeldingPanelShort;
