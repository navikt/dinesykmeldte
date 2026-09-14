"use client";

import { ChatIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  CopyButton,
  Detail,
  Heading,
  HStack,
  Link,
  List,
  ReadMore,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Ansatt } from "../types";
import { NAV_VEILEDNING_URL } from "../utils/oppfolging";

/**
 * Kort forberedelsesstøtte som kan kopieres og deles i en kanal leder allerede
 * bruker. Vi oppretter ikke et nytt referatskjema ved siden av oppfølgingsplanen.
 */
function forberedelsestekst(ansatt: Ansatt): string {
  return [
    `Hei ${ansatt.navn.split(" ")[0]},`,
    "",
    "Jeg vil gjerne avtale en samtale om hvordan vi kan legge til rette for deg i jobben. Dette kalles dialogmøte 1.",
    "",
    "Før vi snakkes kan du gjerne tenke gjennom:",
    "- Hvilke arbeidsoppgaver fungerer greit nå?",
    "- Hva er vanskelig å få til?",
    "- Er det noe vi kan endre på i oppgaver, tid eller arbeidssted?",
    "",
    "Du trenger ikke fortelle noe om diagnose eller helse. Det er arbeidshverdagen vi skal snakke om.",
    "",
    "Si fra hvilket tidspunkt som passer for deg.",
  ].join("\n");
}

export function ForberedelseKort({
  ansatt,
  apenSomStandard = false,
}: {
  ansatt: Ansatt;
  apenSomStandard?: boolean;
}): ReactElement {
  const tekst = forberedelsestekst(ansatt);

  return (
    <Box
      borderWidth="1"
      borderColor="neutral-subtle"
      borderRadius="12"
      padding="space-20"
      background="default"
    >
      <VStack gap="space-16">
        <HStack gap="space-8" align="center">
          <ChatIcon aria-hidden fontSize="1.5rem" />
          <Heading size="small" level="3">
            Slik forbereder dere samtalen
          </Heading>
        </HStack>

        <BodyLong>
          Dialogmøte 1 er en samtale mellom deg og den ansatte om hva som skal
          til for å være i jobb. Du som leder har ansvaret for å ta initiativ.
        </BodyLong>

        <VStack gap="space-8">
          <Heading size="xsmall" level="4">
            Før samtalen
          </Heading>
          <List size="small">
            <List.Item>
              Tenk gjennom hvilke oppgaver som finnes, og hva som kan tilpasses.
            </List.Item>
            <List.Item>
              Be den ansatte tenke gjennom hva som fungerer og hva som er
              vanskelig.
            </List.Item>
            <List.Item>
              Hold samtalen på arbeidsoppgaver — du skal ikke spørre om
              diagnose.
            </List.Item>
          </List>
        </VStack>

        <ReadMore
          header="I samtalen og på slutten"
          defaultOpen={apenSomStandard}
        >
          <VStack gap="space-12">
            <VStack gap="space-4">
              <Heading size="xsmall" level="4">
                I samtalen
              </Heading>
              <List size="small">
                <List.Item>Hva kan prøves eller videreføres?</List.Item>
                <List.Item>Hva hindrer tilrettelegging hos dere?</List.Item>
                <List.Item>Trenger dere bistand utenfra?</List.Item>
              </List>
            </VStack>
            <VStack gap="space-4">
              <Heading size="xsmall" level="4">
                Før dere avslutter
              </Heading>
              <List size="small">
                <List.Item>Hva skal hver av dere gjøre?</List.Item>
                <List.Item>Når snakker dere sammen igjen?</List.Item>
                <List.Item>Skriv det ned i oppfølgingsplanen.</List.Item>
              </List>
            </VStack>
          </VStack>
        </ReadMore>

        <Box background="neutral-soft" padding="space-16" borderRadius="8">
          <VStack gap="space-12">
            <HStack justify="space-between" align="center" wrap={false}>
              <Heading size="xsmall" level="4">
                Tekst du kan sende til {ansatt.navn.split(" ")[0]}
              </Heading>
              <CopyButton
                copyText={tekst}
                text="Kopier"
                activeText="Kopiert"
                size="small"
              />
            </HStack>
            <BodyShort size="small" style={{ whiteSpace: "pre-line" }}>
              {tekst}
            </BodyShort>
            <Detail>
              Du kan lime teksten inn i e-post, chat eller den kanalen dere
              allerede bruker. Prototypen sender ingenting.
            </Detail>
          </VStack>
        </Box>

        <Detail>
          <Link href={NAV_VEILEDNING_URL} target="_blank" rel="noreferrer">
            Les Navs veiledning om oppfølging av sykmeldte
          </Link>
        </Detail>
      </VStack>
    </Box>
  );
}
