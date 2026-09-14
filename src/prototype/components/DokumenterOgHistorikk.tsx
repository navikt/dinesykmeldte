"use client";

import {
  DocPencilIcon,
  FileTextIcon,
  FolderIcon,
  HandshakeIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Detail,
  Heading,
  LinkCard,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Ansatt } from "../types";
import { formatDato } from "../utils/format";
import { DIALOGMOTE_URL, PLAN_URL } from "../utils/oppfolging";

/**
 * Samler dokumenttilgangen som finnes på dagens ansattside. Innholdet er det
 * samme, men det ligger i én rolig seksjon i stedet for fire like store paneler
 * som konkurrerer med det som faktisk er aktuelt nå.
 */
export function DokumenterOgHistorikk({
  ansatt,
  tittel = "Dokumenter og historikk",
}: {
  ansatt: Ansatt;
  tittel?: string;
}): ReactElement {
  const planBeskrivelse = (): string => {
    switch (ansatt.oppfolgingsplan.status) {
      case "delt":
        return `Sist endret ${formatDato(ansatt.oppfolgingsplan.sistEndret ?? "")}`;
      case "under-arbeid":
        return "Påbegynt, ikke delt med Nav";
      case "ingen-i-nav":
        return "Ingen plan i Navs løsning";
    }
  };

  return (
    <VStack gap="space-12">
      <Heading size="small" level="2">
        {tittel}
      </Heading>

      <VStack gap="space-8">
        <LinkCard size="small">
          <LinkCard.Icon>
            <FileTextIcon aria-hidden fontSize="1.5rem" />
          </LinkCard.Icon>
          <LinkCard.Title as="h3">
            <LinkCard.Anchor href="#sykmeldinger">Sykmeldinger</LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            {`${ansatt.antallSykmeldinger} i dette forløpet`}
          </LinkCard.Description>
        </LinkCard>

        <LinkCard size="small">
          <LinkCard.Icon>
            <DocPencilIcon aria-hidden fontSize="1.5rem" />
          </LinkCard.Icon>
          <LinkCard.Title as="h3">
            <LinkCard.Anchor href="#soknader">Søknader</LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            {`${ansatt.antallSoknader} sendt`}
          </LinkCard.Description>
        </LinkCard>

        <LinkCard size="small">
          <LinkCard.Icon>
            <FolderIcon aria-hidden fontSize="1.5rem" />
          </LinkCard.Icon>
          <LinkCard.Title as="h3">
            <LinkCard.Anchor
              href={`${PLAN_URL}/${ansatt.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Oppfølgingsplan
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{planBeskrivelse()}</LinkCard.Description>
        </LinkCard>

        <LinkCard size="small">
          <LinkCard.Icon>
            <HandshakeIcon aria-hidden fontSize="1.5rem" />
          </LinkCard.Icon>
          <LinkCard.Title as="h3">
            <LinkCard.Anchor
              href={`${DIALOGMOTE_URL}/${ansatt.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Dialogmøter
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Innkallinger og referater fra Nav
          </LinkCard.Description>
        </LinkCard>
      </VStack>

      {ansatt.oppfolgingsplan.status === "ingen-i-nav" && (
        <Box background="neutral-soft" padding="space-16" borderRadius="8">
          <VStack gap="space-4">
            <BodyShort size="small">
              Vi finner ingen oppfølgingsplan for {ansatt.navn.split(" ")[0]} i
              Navs løsning.
            </BodyShort>
            <Detail>
              Det betyr ikke sikkert at det ikke finnes en plan. Bruker dere et
              eget system, ligger den der.
            </Detail>
          </VStack>
        </Box>
      )}

      <Detail>
        Av personvernhensyn vises dokumentene inntil fire måneder etter at den
        ansatte er frisk. Alle sykmeldinger finnes i Altinn.
      </Detail>
    </VStack>
  );
}
