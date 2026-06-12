import { BellIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  HStack,
  InfoCard,
  InlineMessage,
  Loader,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useEffect, useRef } from "react";
import { logAmplitudeEvent } from "../../../amplitude/amplitude";
import { usePaaminnelse } from "../../../hooks/usePaaminnelse";
import type { PaaminnelseFeilkode } from "../../../services/paaminnelse/paaminnelseContract";
import { formatDateTime } from "../../../utils/dateUtils";

interface Props {
  narmestelederId: string;
}

const PAAMINNELSE_COMPONENT = "påminnelse om oppfølgingsplan";
const BESTILL_HANDLING = "bestill påminnelse om oppfølgingsplan";
const AVBESTILL_HANDLING = "avbestill påminnelse om oppfølgingsplan";

function PaaminnelseModul({ narmestelederId }: Props): ReactElement | null {
  const paaminnelse = usePaaminnelse(narmestelederId);
  const hasLoggedVisibleStateRef = useRef(false);

  useEffect(() => {
    if (
      hasLoggedVisibleStateRef.current ||
      (paaminnelse.status !== "tilbud" && paaminnelse.status !== "bestilt")
    ) {
      return;
    }

    hasLoggedVisibleStateRef.current = true;
    void logAmplitudeEvent({
      eventName: "komponent vist",
      data: { komponent: PAAMINNELSE_COMPONENT },
    });
  }, [paaminnelse.status]);

  if (paaminnelse.status === "skjult") {
    return null;
  }

  if (paaminnelse.status === "laster") {
    return (
      <InfoCard
        as="section"
        aria-label="Påminnelse om oppfølgingsplan"
        aria-busy="true"
        data-color="info"
        size="small"
      >
        <InfoCard.Content>
          <HStack gap="space-8" align="center">
            <Loader size="small" title="Laster" />
            <BodyShort size="small">Sjekker påminnelse</BodyShort>
          </HStack>
        </InfoCard.Content>
      </InfoCard>
    );
  }

  const isBestilt = paaminnelse.status === "bestilt";
  const title = isBestilt
    ? "Påminnelse om oppfølgingsplan er bestilt"
    : "Vil du bli minnet på oppfølgingsplanen?";
  const buttonText = isBestilt ? "Avbestill påminnelse" : "Bestill påminnelse";
  const action = isBestilt ? paaminnelse.avbestill : paaminnelse.bestill;
  const handling = isBestilt ? AVBESTILL_HANDLING : BESTILL_HANDLING;

  return (
    <InfoCard
      as="section"
      aria-labelledby="paaminnelse-om-oppfolgingsplan-title"
      data-color={isBestilt ? "success" : "info"}
      size="small"
    >
      <InfoCard.Header icon={<BellIcon aria-hidden />}>
        <InfoCard.Title id="paaminnelse-om-oppfolgingsplan-title">
          {title}
        </InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content>
        <VStack gap="space-16">
          <VStack gap="space-8">
            <BodyLong size="small">
              {isBestilt
                ? "Vi gir beskjed når det kan være aktuelt å lage en oppfølgingsplan."
                : "Du kan få en påminnelse når det kan være aktuelt å lage en oppfølgingsplan."}
            </BodyLong>
            {isBestilt && paaminnelse.paaminnelse.reminderTiming?.triggerAt && (
              <BodyShort size="small">
                Påminnelsen er planlagt{" "}
                {formatDateTime(
                  paaminnelse.paaminnelse.reminderTiming.triggerAt,
                )}
                .
              </BodyShort>
            )}
          </VStack>

          {paaminnelse.inlineError && (
            <InlineMessage status="error" size="small" role="alert">
              {getInlineErrorText(paaminnelse.inlineError)}
            </InlineMessage>
          )}

          <HStack gap="space-8" wrap>
            <Button
              data-color={isBestilt ? "neutral" : undefined}
              loading={paaminnelse.isMutating}
              onClick={() => {
                void logAmplitudeEvent({
                  eventName: "handling",
                  data: { navn: handling },
                });
                void action();
              }}
              size="small"
              variant={isBestilt ? "secondary" : "primary"}
            >
              {buttonText}
            </Button>
          </HStack>
        </VStack>
      </InfoCard.Content>
    </InfoCard>
  );
}

function getInlineErrorText(feilkode: PaaminnelseFeilkode): string {
  switch (feilkode) {
    case "BESTILLING_FEILET":
      return "Vi klarte ikke å bestille påminnelsen. Prøv igjen.";
    case "AVBESTILLING_FEILET":
      return "Vi klarte ikke å avbestille påminnelsen. Prøv igjen.";
    case "IKKE_AUTORISERT":
      return "Du har ikke tilgang til å endre denne påminnelsen.";
    case "STATUS_FEILET":
    case "UGYLDIG_FORESPORSEL":
      return "Vi klarte ikke å oppdatere påminnelsen. Prøv igjen.";
  }
}

export default PaaminnelseModul;
