"use client";

import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Link,
  Process,
  ReadMore,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useState } from "react";
import { AktueltNaBlokk } from "../components/AktueltNaBlokk";
import { Dm1StatusDialog, Dm1StatusKort } from "../components/Dm1StatusKort";
import { DokumenterOgHistorikk } from "../components/DokumenterOgHistorikk";
import { ForberedelseKort } from "../components/ForberedelseKort";
import { KildeMerke } from "../components/KildeMerke";
import { Nokkelinfo } from "../components/Nokkelinfo";
import { VidereAvtale } from "../components/VidereAvtale";
import { usePrototype } from "../state/PrototypeContext";
import type { Hendelse } from "../types";
import { formatDato } from "../utils/format";
import { erFortid, utledAktueltNa, utledTidslinje } from "../utils/oppfolging";

/**
 * Variant B — Oppfølging over tid. Hovedhypotesen.
 *
 * Forløpet er den bærende strukturen: hva som har skjedd, hva som er aktuelt nå
 * og hvilke stoppunkter som kommer. Hvert punkt bærer kilden sin, slik at
 * forventede stoppunkter aldri forveksles med avtaler eller registrerte fakta.
 */
export function VariantB(): ReactElement {
  const { fokusAnsatt, dm1For } = usePrototype();
  const [dialogApen, setDialogApen] = useState(false);
  const dm1 = dm1For(fokusAnsatt.id);
  const aktuelt = utledAktueltNa(fokusAnsatt, dm1);
  const tidslinje = utledTidslinje(fokusAnsatt, dm1);

  const fortid = tidslinje.filter(erFortid);
  const fremover = tidslinje.filter((h) => !erFortid(h));

  const krevErStatusHandling =
    aktuelt.handling.id === "registrer-dm1" ||
    aktuelt.handling.id === "endre-dm1";

  const renderHendelse = (
    hendelse: Hendelse,
    status: "completed" | "active" | "uncompleted",
  ): ReactElement => (
    <Process.Event
      key={hendelse.id}
      title={hendelse.tittel}
      timestamp={
        hendelse.datoTekst ??
        (hendelse.dato ? formatDato(hendelse.dato) : "Tidspunkt ikke kjent")
      }
      status={status}
    >
      <VStack gap="space-8" paddingBlock="space-4 space-12">
        <HStack>
          <KildeMerke kilde={hendelse.kilde} />
        </HStack>
        <BodyShort size="small">{hendelse.beskrivelse}</BodyShort>
        {hendelse.presisering && (
          <Detail textColor="subtle">{hendelse.presisering}</Detail>
        )}
        {hendelse.handling && (
          <HStack paddingBlock="space-4 space-0">
            {hendelse.handling.href ? (
              <Button
                variant="secondary"
                size="small"
                as="a"
                href={hendelse.handling.href}
                target="_blank"
                rel="noreferrer"
              >
                {hendelse.handling.tekst}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setDialogApen(true)}
              >
                {hendelse.handling.tekst}
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    </Process.Event>
  );

  return (
    <VStack gap="space-32">
      <VStack gap="space-8">
        <Heading size="xlarge" level="1">
          {fokusAnsatt.navn}
        </Heading>
        <BodyShort textColor="subtle">{fokusAnsatt.situasjon}</BodyShort>
      </VStack>

      <Nokkelinfo
        ansatt={fokusAnsatt}
        fremhevSykepenger={
          (fokusAnsatt.sykepenger?.gjenstaendeDager ?? 999) < 90
        }
      />

      <AktueltNaBlokk
        aktuelt={aktuelt}
        onHandling={
          krevErStatusHandling ? () => setDialogApen(true) : undefined
        }
      />

      {aktuelt.handling.id === "forbered-dm1" && (
        <ForberedelseKort ansatt={fokusAnsatt} />
      )}

      <VStack gap="space-16">
        <VStack gap="space-4">
          <Heading size="medium" level="2">
            Oppfølgingen så langt og videre
          </Heading>
          <BodyLong size="small" textColor="subtle">
            {`Forløpet startet ${formatDato(fokusAnsatt.forlopStart)}. En ny sykmelding starter ikke et nytt forløp — tidslinjen fortsetter.`}
          </BodyLong>
        </VStack>

        <Box
          borderWidth="1"
          borderColor="neutral-subtle"
          borderRadius="12"
          padding={{ xs: "space-16", md: "space-24" }}
          background="default"
        >
          <VStack gap="space-20">
            {fortid.length > 3 && (
              <ReadMore header={`Tidligere i forløpet (${fortid.length - 3})`}>
                <Box paddingBlock="space-12 space-0">
                  <Process>
                    {fortid
                      .slice(0, fortid.length - 3)
                      .map((h) => renderHendelse(h, "completed"))}
                  </Process>
                </Box>
              </ReadMore>
            )}

            <Process>
              {fortid
                .slice(Math.max(0, fortid.length - 3))
                .map((h) => renderHendelse(h, "completed"))}
              {fremover.map((h, i) =>
                renderHendelse(h, i === 0 ? "active" : "uncompleted"),
              )}
            </Process>

            <Box background="neutral-soft" padding="space-12" borderRadius="8">
              <Detail>
                Punktene framover er tidspunkter i oppfølgingen, ikke avtaler
                som er satt. En innkalling fra Nav vises som en egen hendelse
                når den kommer.
              </Detail>
            </Box>
          </VStack>
        </Box>
      </VStack>

      <Dm1StatusKort ansatt={fokusAnsatt} />

      <VidereAvtale ansatt={fokusAnsatt} />

      <Box background="neutral-soft" padding="space-16" borderRadius="8">
        <VStack gap="space-4">
          <BodyShort size="small" weight="semibold">
            Spørsmålene Nav stiller {fokusAnsatt.navn.split(" ")[0]}
          </BodyShort>
          <Detail>
            Nav spør den sykmeldte om egen situasjon. Svarene deles ikke
            automatisk med deg som arbeidsgiver. Det dere skal snakke om,
            avtaler dere direkte.{" "}
            <Link href="#kartlegging">Les mer om hva Nav spør om</Link>
          </Detail>
        </VStack>
      </Box>

      <DokumenterOgHistorikk ansatt={fokusAnsatt} />

      <Dm1StatusDialog
        ansatt={fokusAnsatt}
        apen={dialogApen}
        lukk={() => setDialogApen(false)}
      />
    </VStack>
  );
}
