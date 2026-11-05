"use client";

import { CalendarIcon, PersonHeadsetIcon } from "@navikt/aksel-icons";
import { Heading, LinkCard, VStack } from "@navikt/ds-react";
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
        Mer om oppfølgingen
      </Heading>
      <VStack as="ul" gap="space-12">
        <li>
          <LinkCard>
            <LinkCard.Icon>
              <CalendarIcon fontSize="2rem" />
            </LinkCard.Icon>
            <LinkCard.Title>
              <LinkCard.Anchor
                href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  recordStegoversiktLinkClick(gruppe, "videre_oppfolging")
                }
              >
                Oppfølging underveis i sykefraværet
              </LinkCard.Anchor>
            </LinkCard.Title>
            <LinkCard.Description>
              Se hva som skjer videre i sykefraværet, frem til uke 26 og etter.
            </LinkCard.Description>
          </LinkCard>
        </li>
        <li>
          <LinkCard>
            <LinkCard.Icon>
              <PersonHeadsetIcon fontSize="2rem" />
            </LinkCard.Icon>
            <LinkCard.Title>
              <LinkCard.Anchor
                href="https://www.nav.no/arbeidsgiver/kontaktoss"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  recordStegoversiktLinkClick(gruppe, "kontakt_nav")
                }
              >
                Kontakt Nav som arbeidsgiver
              </LinkCard.Anchor>
            </LinkCard.Title>
            <LinkCard.Description>
              Få hjelp fra Nav med oppfølgingen av en sykmeldt ansatt.
            </LinkCard.Description>
          </LinkCard>
        </li>
      </VStack>
    </VStack>
  );
}

export default MerOmOppfolging;
