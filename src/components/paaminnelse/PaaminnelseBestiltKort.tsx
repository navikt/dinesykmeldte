import { BodyLong, LocalAlert, VStack } from "@navikt/ds-react";
import type { ReactElement, ReactNode } from "react";

type Props = {
  readonly feilmelding: ReactNode;
  readonly handling: ReactNode;
};

/**
 * Bestilt tilstand: grønn suksess-LocalAlert. LocalAlert (variant strong) rendrer
 * en indre `role="alert"` som annonserer seg selv ved bestilling. Kortet eier kun
 * sitt eget innhold; wrapperen bygger `feilmelding`/`handling`.
 */
export default function PaaminnelseBestiltKort({
  feilmelding,
  handling,
}: Props): ReactElement {
  return (
    <LocalAlert status="success">
      <LocalAlert.Header>
        <LocalAlert.Title as="h2">Du vil få en påminnelse</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        <VStack gap="space-24">
          <BodyLong size="small">
            Dersom du ikke allerede har sendt inn en plan, får du påminnelse på
            e-post når fristen nærmer seg.
          </BodyLong>
          {feilmelding}
          {handling}
        </VStack>
      </LocalAlert.Content>
    </LocalAlert>
  );
}
