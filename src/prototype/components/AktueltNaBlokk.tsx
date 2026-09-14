"use client";

import { ArrowRightIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Tag,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement, ReactNode } from "react";
import type { AktueltNa } from "../types";
import { formatDato } from "../utils/format";

/**
 * Tempo styrer plassering og vekt, ikke et brudd-varsel. En ukjent DM1-status
 * skal aldri framstå som at plikten er brutt.
 */
const TEMPO_ETIKETT: Record<AktueltNa["tempo"], string> = {
  tidskritisk: "Haster mest",
  aktuelt: "Aktuelt nå",
  "til-orientering": "Til orientering",
};

const TEMPO_FARGE: Record<AktueltNa["tempo"], "warning" | "info" | "neutral"> =
  {
    tidskritisk: "warning",
    aktuelt: "info",
    "til-orientering": "neutral",
  };

interface Props {
  aktuelt: AktueltNa;
  /** Ekstra handlingsinnhold, f.eks. statusvalg eller forberedelse. */
  children?: ReactNode;
  /** Overskriftsnivå tilpasses variantens sidestruktur. */
  overskriftNiva?: "2" | "3";
  onHandling?: () => void;
}

export function AktueltNaBlokk({
  aktuelt,
  children,
  overskriftNiva = "2",
  onHandling,
}: Props): ReactElement {
  const { handling } = aktuelt;

  return (
    <Box
      borderWidth="2"
      borderColor="info-subtle"
      borderRadius="12"
      background="info-soft"
      padding={{ xs: "space-16", md: "space-24" }}
    >
      <VStack gap="space-16">
        <HStack gap="space-8" align="center" wrap>
          <Tag
            variant="strong"
            data-color={TEMPO_FARGE[aktuelt.tempo]}
            size="small"
          >
            {TEMPO_ETIKETT[aktuelt.tempo]}
          </Tag>
          {aktuelt.fristDato && (
            <Detail>{`Gjelder ${formatDato(aktuelt.fristDato)}`}</Detail>
          )}
        </HStack>

        <VStack gap="space-8">
          <Heading size="large" level={overskriftNiva}>
            {aktuelt.tittel}
          </Heading>
          <BodyLong>{aktuelt.beskrivelse}</BodyLong>
        </VStack>

        <HStack gap="space-8" align="start" wrap={false}>
          <InformationSquareIcon aria-hidden fontSize="1.25rem" />
          <Detail>{`Hvorfor du ser dette: ${aktuelt.begrunnelse}`}</Detail>
        </HStack>

        {handling.href ? (
          <HStack>
            <Button
              as="a"
              href={handling.href}
              target="_blank"
              rel="noreferrer"
              icon={<ArrowRightIcon aria-hidden />}
              iconPosition="right"
            >
              {handling.tekst}
            </Button>
          </HStack>
        ) : onHandling ? (
          <HStack>
            <Button
              onClick={onHandling}
              icon={<ArrowRightIcon aria-hidden />}
              iconPosition="right"
            >
              {handling.tekst}
            </Button>
          </HStack>
        ) : null}

        {children}
      </VStack>
    </Box>
  );
}

export { TEMPO_ETIKETT, TEMPO_FARGE };
