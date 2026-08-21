"use client";

import {
  Accordion,
  BodyLong,
  BodyShort,
  Box,
  Heading,
  Link,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";

const HEADING_ID = "ansvar-ved-sykefravaer-heading";

const ANSVARSPUNKTER = [
  {
    title: "Slik lager du en oppfølgingsplan",
    bodyText:
      "Lag planen sammen med den som er sykmeldt innen 4 uker. Den skal beskrive arbeidsoppgaver som er mulige nå, og tilretteleggingen dere blir enige om. Målet med oppfølgingsplanen er å etablere løsninger som er tilpasset den sykmeldtes situasjon og arbeidsgivers muligheter for tilrettelegging.",
    linkText: "Om oppfølgingsplan på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolgingsplan",
  },
  {
    title: "Slik gjennomfører du dialogmøte 1",
    bodyText:
      "Dialogmøte 1 er et lovpålagt møte (frist innen 7 uker) som handler om veien tilbake til jobb, hvilke muligheter som finnes og konkrete videre steg i sykefraværsforløpet. Målet er å unngå unødvendig langt sykefravær. I tillegg anbefaler vi regelmessig kontakt gjennom hele forløpet uavhengig av varighet. Finn ut sammen hva som passer best.",
    linkText: "Om dialogmøte på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-1",
  },
  {
    title: "Slik tilrettelegger du for den som er sykmeldt",
    bodyText:
      "Du har ansvar for å tilrettelegge så langt det er mulig, slik at den som er sykmeldt klarer å utføre noen oppgaver eller jobbe litt i sykmeldingsperioden. Det kan også være tilpasset arbeidstid, nødvendige hjelpemidler eller nye arbeidsoppgaver. Den ansatte har på sin side plikt til å bidra så dere sammen finner løsninger som fungerer.",
    linkText: "Om tilrettelegging på nav.no",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#tilrettelegging",
  },
  {
    title: "Slik følger du opp gjennom hele sykefraværet",
    bodyText:
      "Hold jevnlig kontakt med den ansatte gjennom hele sykefraværet. Husk å overholde frister og melde gjerne fra til oss i Nav hvis du/dere trenger hjelp til noe. Din innsats kan være avgjørende for tilknytningen til arbeidslivet for den som er sykmeldt. Vi vet at tett samarbeid og dialog bidrar til at flere kommer tidligere tilbake i jobb.",
    linkText: "Oppfølging underveis i sykefraværet",
    href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte",
  },
] as const;

function AnsvarVedSykefravaer(): ReactElement {
  return (
    <Box
      as="section"
      aria-labelledby={HEADING_ID}
      marginBlock={{ xs: "space-32", md: "space-40" }}
    >
      <VStack gap={{ xs: "space-16", md: "space-24" }}>
        <Heading id={HEADING_ID} level="2" size="medium">
          Ditt ansvar når en av dine ansatte er sykmeldt
        </Heading>

        <Accordion data-color="accent" size="medium">
          {ANSVARSPUNKTER.map(({ title, bodyText, linkText, href }) => (
            <Accordion.Item key={href}>
              <Accordion.Header>{title}</Accordion.Header>
              <Accordion.Content>
                <VStack gap="space-16">
                  <BodyLong>{bodyText}</BodyLong>
                  <Link href={href}>{linkText}</Link>
                </VStack>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>

        <VStack gap="space-4">
          <BodyShort size="large" weight="semibold">
            Trenger du å snakke med noen om en sak?
          </BodyShort>
          <Link href="https://www.nav.no/arbeidsgiver/kontaktoss">
            Kontakt Nav som arbeidsgiver
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}

export default AnsvarVedSykefravaer;
