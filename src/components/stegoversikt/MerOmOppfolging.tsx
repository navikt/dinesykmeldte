"use client";

import { CalendarIcon, PersonHeadsetIcon } from "@navikt/aksel-icons";
import { BodyShort, Heading, HStack, Link, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { recordStegoversiktLinkClick } from "./stegoversiktTelemetry";

function MerOmOppfolging({
  gruppe,
}: {
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  return (
    <VStack
      as="section"
      aria-labelledby="mer-om-oppfolging-heading"
      gap="space-16"
      marginBlock={{ xs: "space-32", md: "space-40" }}
    >
      <Heading id="mer-om-oppfolging-heading" level="2" size="small">
        Mer om hvordan du kan følge opp dine arbeidstakere som er sykmeldt
      </Heading>
      <VStack as="ul" gap="space-12">
        <HStack as="li" align="start" gap="space-12">
          <CalendarIcon aria-hidden fontSize="1.5rem" />
          <VStack gap="space-4">
            <Link
              href="https://idebanken.no/folge-opp-sykefravaer"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                recordStegoversiktLinkClick(gruppe, "videre_oppfolging")
              }
            >
              Følg opp sykefravær (Idébanken)
            </Link>
            <BodyShort textColor="subtle">
              Her får du konkrete tips og verktøy du kan bruke i oppfølgingen
            </BodyShort>
          </VStack>
        </HStack>
        <HStack as="li" align="start" gap="space-12">
          <PersonHeadsetIcon aria-hidden fontSize="1.5rem" />
          <VStack gap="space-4">
            <Link
              href="https://www.nav.no/arbeidsgiver/kontaktoss"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordStegoversiktLinkClick(gruppe, "kontakt_nav")}
            >
              Kontakt Nav
            </Link>
            <BodyShort textColor="subtle">
              Ta kontakt om du trenger hjelp med en sak
            </BodyShort>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  );
}

export default MerOmOppfolging;
