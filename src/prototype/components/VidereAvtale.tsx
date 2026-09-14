"use client";

import { ArrowRightIcon, HandshakeIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import { addWeeks, formatISO } from "date-fns";
import { type ReactElement, useState } from "react";
import type { Ansatt } from "../types";
import { formatDato } from "../utils/format";
import { PLAN_URL } from "../utils/oppfolging";

type Avtale = { valgt: string; dato: string };

const ALTERNATIVER = [
  { id: "2-uker", tekst: "Om to uker", uker: 2 },
  { id: "4-uker", tekst: "Om fire uker", uker: 4 },
  { id: "8-uker", tekst: "Om åtte uker", uker: 8 },
];

/**
 * Den konkrete videre avtalen — det briefet peker på som selve utbyttet av
 * møtet. Avtalen lagres bare i minnet og hører i produksjon hjemme i den
 * eksisterende oppfølgingsplanen, ikke i et nytt parallelt skjema.
 */
export function VidereAvtale({ ansatt }: { ansatt: Ansatt }): ReactElement {
  const [valgt, setValgt] = useState<string | null>(null);
  const [avtale, setAvtale] = useState<Avtale | null>(null);

  const lagre = (): void => {
    const alternativ = ALTERNATIVER.find((a) => a.id === valgt);
    if (!alternativ) return;
    setAvtale({
      valgt: alternativ.tekst,
      dato: formatISO(addWeeks(new Date(), alternativ.uker), {
        representation: "date",
      }),
    });
  };

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
          <HandshakeIcon aria-hidden fontSize="1.5rem" />
          <Heading size="small" level="3">
            Avtal når dere snakkes igjen
          </Heading>
        </HStack>

        {avtale ? (
          <VStack gap="space-12">
            <BodyLong>
              {`Dere har avtalt en ny samtale ${avtale.valgt.toLowerCase()}, rundt ${formatDato(avtale.dato)}.`}
            </BodyLong>
            <Detail>
              I en ferdig løsning ville dette stått i oppfølgingsplanen dere
              allerede har. Her lever det bare i prototypen.
            </Detail>
            <HStack gap="space-8">
              <Button
                variant="secondary"
                size="small"
                as="a"
                href={`${PLAN_URL}/${ansatt.id}`}
                target="_blank"
                rel="noreferrer"
                icon={<ArrowRightIcon aria-hidden />}
                iconPosition="right"
              >
                Skriv det inn i oppfølgingsplanen
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                  setAvtale(null);
                  setValgt(null);
                }}
              >
                Endre
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack gap="space-16">
            <BodyLong>
              En samtale uten et neste steg blir fort hengende i lufta. Sett et
              tidspunkt for når dere skal se på situasjonen igjen.
            </BodyLong>
            <RadioGroup
              legend="Når snakkes dere igjen?"
              size="small"
              value={valgt ?? ""}
              onChange={(v: string) => setValgt(v)}
            >
              {ALTERNATIVER.map((alternativ) => (
                <Radio key={alternativ.id} value={alternativ.id}>
                  {alternativ.tekst}
                </Radio>
              ))}
            </RadioGroup>
            <HStack gap="space-8">
              <Button size="small" onClick={lagre} disabled={!valgt}>
                Sett tidspunkt
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
