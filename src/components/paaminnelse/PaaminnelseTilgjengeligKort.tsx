import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyLong, InfoCard, VStack } from "@navikt/ds-react";
import type { ReactElement, ReactNode } from "react";

type Props = {
  readonly headingId: string;
  readonly feilmelding: ReactNode;
  readonly handling: ReactNode;
};

/**
 * Ikke-bestilt tilstand: blå InfoCard som oppfordrer til tidlig oppfølging og
 * tilbyr å bestille påminnelse. Kortet eier kun sitt eget innhold; wrapperen eier
 * a11y (aria-labelledby via `headingId`) og bygger `feilmelding`/`handling`.
 */
export default function PaaminnelseTilgjengeligKort({
  headingId,
  feilmelding,
  handling,
}: Props): ReactElement {
  return (
    <InfoCard data-color="info">
      <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
        <InfoCard.Title as="h2" id={headingId}>
          Start oppfølging tidlig
        </InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content>
        <VStack gap="space-24">
          <VStack gap="space-20">
            <BodyLong size="small">
              Som nærmeste leder er din oppfølging ofte avgjørende for hvor
              raskt den ansatte kommer tilbake. Start med en tidlig samtale.
            </BodyLong>
            <BodyLong size="small">
              Som hovedregel har du ansvar for at dere lager en oppfølgingsplan
              innen 4 uker. Målet er å finne ut om noen arbeidsoppgaver er mulig
              å gjøre i sykmeldingsperioden.
            </BodyLong>
            <BodyLong size="small" weight="semibold">
              Vil du ha en påminnelse på e-post når fristen for å lage en plan
              nærmer seg?
            </BodyLong>
          </VStack>
          {feilmelding}
          {handling}
        </VStack>
      </InfoCard.Content>
    </InfoCard>
  );
}
