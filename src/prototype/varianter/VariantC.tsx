"use client";

import { ArrowLeftIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Tag,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useState } from "react";
import { TEMPO_ETIKETT, TEMPO_FARGE } from "../components/AktueltNaBlokk";
import { Dm1StatusDialog } from "../components/Dm1StatusKort";
import { usePrototype } from "../state/PrototypeContext";
import type { AktueltNa, Ansatt } from "../types";
import { formatDato } from "../utils/format";
import { utledAktueltNa } from "../utils/oppfolging";
import { VariantB } from "./VariantB";

type Filter = "na" | "senere" | "alle";

const TEMPO_VEKT: Record<AktueltNa["tempo"], number> = {
  tidskritisk: 0,
  aktuelt: 1,
  "til-orientering": 2,
};

interface Rad {
  ansatt: Ansatt;
  aktuelt: AktueltNa;
}

/**
 * Variant C — Prioritert arbeidsoversikt.
 *
 * Lista er sortert på når noe er aktuelt, ikke på alvorlighet eller helse.
 * Begrunnelsen står i hver rad, slik at rekkefølgen kan etterprøves av leder.
 */
export function VariantC(): ReactElement {
  const { ansatte, dm1For, setFokusAnsattId } = usePrototype();
  const [filter, setFilter] = useState<Filter>("na");
  const [apenDetalj, setApenDetalj] = useState<string | null>(null);
  const [statusDialogFor, setStatusDialogFor] = useState<Ansatt | null>(null);

  const rader: Rad[] = ansatte
    .map((ansatt) => ({
      ansatt,
      aktuelt: utledAktueltNa(ansatt, dm1For(ansatt.id)),
    }))
    .sort((a, b) => {
      const vekt = TEMPO_VEKT[a.aktuelt.tempo] - TEMPO_VEKT[b.aktuelt.tempo];
      if (vekt !== 0) return vekt;
      return (a.aktuelt.fristDato ?? "9999").localeCompare(
        b.aktuelt.fristDato ?? "9999",
      );
    });

  const synlige = rader.filter(({ aktuelt }) => {
    if (filter === "alle") return true;
    if (filter === "na") return aktuelt.tempo !== "til-orientering";
    return aktuelt.tempo === "til-orientering";
  });

  const antallNa = rader.filter(
    (r) => r.aktuelt.tempo !== "til-orientering",
  ).length;

  if (apenDetalj) {
    return (
      <VStack gap="space-20">
        <HStack>
          <Button
            variant="tertiary"
            size="small"
            icon={<ArrowLeftIcon aria-hidden />}
            onClick={() => setApenDetalj(null)}
          >
            Tilbake til oversikten
          </Button>
        </HStack>
        <Box background="neutral-soft" padding="space-12" borderRadius="8">
          <Detail>
            Detaljvisningen er variant B. Oversikten og forløpet er ment å henge
            sammen, ikke være to atskilte løsninger.
          </Detail>
        </Box>
        <VariantB />
      </VStack>
    );
  }

  return (
    <VStack gap="space-24">
      <VStack gap="space-8">
        <Heading size="xlarge" level="1">
          Oppfølging som er aktuell nå
        </Heading>
        <BodyLong textColor="subtle">
          {antallNa === 0
            ? "Ingenting krever noe av deg akkurat nå."
            : `${antallNa} av ${ansatte.length} ansatte har noe som er aktuelt nå.`}
        </BodyLong>
      </VStack>

      <ToggleGroup
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        size="small"
        label="Hva vil du se?"
      >
        <ToggleGroup.Item value="na">Aktuelt nå</ToggleGroup.Item>
        <ToggleGroup.Item value="senere">Kommer senere</ToggleGroup.Item>
        <ToggleGroup.Item value="alle">Alle ansatte</ToggleGroup.Item>
      </ToggleGroup>

      <VStack gap="space-12">
        {synlige.length === 0 && (
          <Box background="neutral-soft" padding="space-20" borderRadius="12">
            <BodyShort>Ingen ansatte i denne visningen nå.</BodyShort>
          </Box>
        )}

        {synlige.map(({ ansatt, aktuelt }) => {
          const statusHandling =
            aktuelt.handling.id === "registrer-dm1" ||
            aktuelt.handling.id === "endre-dm1";

          return (
            <Box
              key={ansatt.id}
              borderWidth="1"
              borderColor={
                aktuelt.tempo === "tidskritisk"
                  ? "warning-subtle"
                  : "neutral-subtle"
              }
              borderRadius="12"
              padding={{ xs: "space-16", md: "space-20" }}
              background="default"
            >
              <VStack gap="space-12">
                <HStack gap="space-8" align="center" wrap>
                  <Tag
                    variant="strong"
                    data-color={TEMPO_FARGE[aktuelt.tempo]}
                    size="xsmall"
                  >
                    {TEMPO_ETIKETT[aktuelt.tempo]}
                  </Tag>
                  {aktuelt.fristDato && (
                    <Detail textColor="subtle">
                      {formatDato(aktuelt.fristDato)}
                    </Detail>
                  )}
                </HStack>

                <VStack gap="space-4">
                  <Heading size="small" level="2">
                    {ansatt.navn}
                  </Heading>
                  <BodyShort weight="semibold">{aktuelt.tittel}</BodyShort>
                  <BodyShort size="small" textColor="subtle">
                    {aktuelt.beskrivelse}
                  </BodyShort>
                </VStack>

                <HStack gap="space-8" align="start" wrap={false}>
                  <InformationSquareIcon aria-hidden fontSize="1.125rem" />
                  <Detail textColor="subtle">
                    {`Prioritert fordi: ${aktuelt.begrunnelse}`}
                  </Detail>
                </HStack>

                <HStack gap="space-8" wrap>
                  {statusHandling ? (
                    <Button
                      size="small"
                      onClick={() => setStatusDialogFor(ansatt)}
                    >
                      {aktuelt.handling.tekst}
                    </Button>
                  ) : aktuelt.handling.href ? (
                    <Button
                      size="small"
                      as="a"
                      href={aktuelt.handling.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {aktuelt.handling.tekst}
                    </Button>
                  ) : (
                    /* Handlinger som krever forløpet rundt seg, rutes til
                       detaljvisningen — oversikten skal aldri være en blindvei. */
                    <Button
                      size="small"
                      onClick={() => {
                        setFokusAnsattId(ansatt.id);
                        setApenDetalj(ansatt.id);
                      }}
                    >
                      {aktuelt.handling.tekst}
                    </Button>
                  )}
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => {
                      setFokusAnsattId(ansatt.id);
                      setApenDetalj(ansatt.id);
                    }}
                  >
                    Se hele forløpet
                  </Button>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </VStack>

      <Box background="neutral-soft" padding="space-16" borderRadius="8">
        <VStack gap="space-4">
          <BodyShort size="small" weight="semibold">
            Slik er lista sortert
          </BodyShort>
          <Detail>
            Rekkefølgen følger tidspunkter i oppfølgingen — ikke hvor alvorlig
            sykefraværet er. Prototypen vurderer ikke helse og gir ingen
            risikoscore.
          </Detail>
        </VStack>
      </Box>

      {statusDialogFor && (
        <Dm1StatusDialog
          ansatt={statusDialogFor}
          apen
          lukk={() => setStatusDialogFor(null)}
        />
      )}
    </VStack>
  );
}
