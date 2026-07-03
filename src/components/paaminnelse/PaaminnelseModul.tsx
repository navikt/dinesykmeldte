import { Button, HStack, LocalAlert } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { SykmeldingFragment } from "../../graphql/queries/graphql.generated";
import PaaminnelseBestiltKort from "./PaaminnelseBestiltKort";
import PaaminnelseTilgjengeligKort from "./PaaminnelseTilgjengeligKort";
import type { Action } from "./paaminnelseModulState";
import { usePaaminnelseModul } from "./usePaaminnelseModul";

const PAAMINNELSE_HEADING_ID = "paaminnelse-oppfolgingsplan-heading";

type Props = {
  readonly narmestelederId: string;
  readonly orgnummer: string;
  readonly sykmeldingPerioder: SykmeldingFragment["perioder"];
};

/**
 * Påminnelse om oppfølgingsplan på enkeltvis sykmelding. Wrapperen eier
 * a11y-vekslingen (aria-labelledby + sr-only role=status) og velger riktig kort;
 * gating, fetch og tilstand ligger i `usePaaminnelseModul`.
 */
export default function PaaminnelseModul({
  narmestelederId,
  orgnummer,
  sykmeldingPerioder,
}: Props): ReactElement | null {
  const modul = usePaaminnelseModul({
    narmestelederId,
    orgnummer,
    sykmeldingPerioder,
  });

  if (modul.visning === "skjult") {
    return null;
  }

  const isBestilt = modul.paaminnelseStatus === "BESTILT";
  const action: Action = isBestilt ? "avbestill" : "bestill";

  const feilmelding = modul.actionError && (
    <LocalAlert status="error" size="small" as="div">
      <LocalAlert.Header>
        <LocalAlert.Title as="h3">
          {modul.actionError === "bestill"
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
        loading={modul.pendingAction === action}
        size="small"
        variant={isBestilt ? "tertiary" : "primary"}
        onClick={() => modul.utfoerHandling(action)}
      >
        {isBestilt ? "Skru av påminnelsen" : "Ja, minn meg på det"}
      </Button>
    </HStack>
  );

  return (
    <section
      // Ikke-bestilt: InfoCard er en <div>, så wrapper-seksjonen navngis av
      // tittelen og blir en ren landmark. Bestilt: LocalAlert rendrer sin egen
      // navngitte <section>, så vi lar wrapperen være unavngitt (ikke en
      // landmark) for å unngå nøstede, navngitte regioner.
      aria-labelledby={isBestilt ? undefined : PAAMINNELSE_HEADING_ID}
      className="mt-10 mb-6 max-w-2xl"
    >
      <span role="status" className="sr-only">
        {modul.statusMessage ?? ""}
      </span>
      {isBestilt ? (
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
