import { Button, HStack, LocalAlert } from "@navikt/ds-react";
import PaaminnelseBestiltKort from "./PaaminnelseBestiltKort";
import PaaminnelseTilgjengeligKort from "./PaaminnelseTilgjengeligKort";
import { usePaaminnelseModul } from "./usePaaminnelseModul";

const PAAMINNELSE_HEADING_ID = "paaminnelse-oppfolgingsplan-heading";

type Props = {
  readonly narmestelederId: string;
  readonly orgnummer: string;
};

/**
 * Påminnelse om oppfølgingsplan på enkeltvis sykmelding. Wrapperen eier
 * a11y-vekslingen (aria-labelledby + sr-only role=status) og velger riktig kort;
 * gating, fetch og tilstand ligger i `usePaaminnelseModul`.
 */
export default function PaaminnelseModul({
  narmestelederId,
  orgnummer,
}: Props) {
  const modul = usePaaminnelseModul({
    narmestelederId,
    orgnummer,
  });

  if (!modul.show) {
    return null;
  }

  const feilmelding = modul.errorOnAction && (
    <LocalAlert status="error" size="small" as="div">
      <LocalAlert.Header>
        <LocalAlert.Title as="h3">
          {modul.errorOnAction === "bestill"
            ? "Vi kunne ikke bestille påminnelsen"
            : "Vi kunne ikke avbestille påminnelsen"}
        </LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        Prøv igjen om litt. Hvis feilen fortsetter, kan du gå videre uten å
        gjøre noe her.
      </LocalAlert.Content>
    </LocalAlert>
  );

  const handling = (
    <HStack gap="space-8" wrap>
      <Button
        loading={modul.isActionPending}
        size="small"
        variant={modul.isBestilt ? "tertiary" : "primary"}
        onClick={modul.executeAction}
      >
        {modul.isBestilt ? "Skru av påminnelsen" : "Ja, minn meg på det"}
      </Button>
    </HStack>
  );

  // Bestilling annonseres av suksess-varselet (LocalAlert med role="alert"), så
  // det trenger ingen sr-only-melding. Avbestilling lander på InfoCard uten
  // alert-rolle, og annonseres derfor via sr-only status-regionen.
  const statusMelding =
    modul.finishedAction === "avbestill"
      ? "Påminnelse om oppfølgingsplan avbestilt"
      : "";

  return (
    <section
      // Ikke-bestilt: InfoCard er en <div>, så wrapper-seksjonen navngis av
      // tittelen og blir en ren landmark. Bestilt: LocalAlert rendrer sin egen
      // navngitte <section>, så vi lar wrapperen være unavngitt (ikke en
      // landmark) for å unngå nøstede, navngitte regioner.
      aria-labelledby={modul.isBestilt ? undefined : PAAMINNELSE_HEADING_ID}
      className="mt-10 mb-6 max-w-2xl"
    >
      <span role="status" className="sr-only">
        {statusMelding}
      </span>
      {modul.isBestilt ? (
        <PaaminnelseBestiltKort feilmelding={feilmelding} handling={handling} />
      ) : (
        <PaaminnelseTilgjengeligKort
          headingId={PAAMINNELSE_HEADING_ID}
          feilmelding={feilmelding}
          handling={handling}
        />
      )}
    </section>
  );
}
