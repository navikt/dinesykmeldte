"use client";

import { CalendarIcon, PersonHeadsetIcon } from "@navikt/aksel-icons";
import { Heading, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import LinkPanel from "../shared/links/LinkPanel";
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
      <VStack gap="space-12">
        <LinkPanel
          Icon={CalendarIcon}
          href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3"
          description="Se hva som skjer videre i sykefraværet, frem til uke 26 og etter."
          external="absolute"
          onClick={() =>
            recordStegoversiktLinkClick(gruppe, "videre_oppfolging")
          }
        >
          Oppfølging underveis i sykefraværet
        </LinkPanel>
        <LinkPanel
          Icon={PersonHeadsetIcon}
          href="https://www.nav.no/arbeidsgiver/kontaktoss"
          description="Få hjelp fra Nav med oppfølgingen av en sykmeldt ansatt."
          external="absolute"
          onClick={() => recordStegoversiktLinkClick(gruppe, "kontakt_nav")}
        >
          Kontakt Nav som arbeidsgiver
        </LinkPanel>
      </VStack>
    </VStack>
  );
}

export default MerOmOppfolging;
