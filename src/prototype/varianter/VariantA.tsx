"use client";

import {
  BodyLong,
  BodyShort,
  Box,
  Detail,
  Heading,
  ReadMore,
  VStack,
} from "@navikt/ds-react";
import { type ReactElement, useState } from "react";
import { AktueltNaBlokk } from "../components/AktueltNaBlokk";
import { Dm1StatusDialog, Dm1StatusKort } from "../components/Dm1StatusKort";
import { DokumenterOgHistorikk } from "../components/DokumenterOgHistorikk";
import { ForberedelseKort } from "../components/ForberedelseKort";
import { Nokkelinfo } from "../components/Nokkelinfo";
import { VidereAvtale } from "../components/VidereAvtale";
import { usePrototype } from "../state/PrototypeContext";
import type { Hendelse } from "../types";
import { formatDato } from "../utils/format";
import { erFortid, utledAktueltNa, utledTidslinje } from "../utils/oppfolging";

/**
 * Variant A — Neste handling.
 *
 * Én ting løftes til topps, resten dempes. Ingen tidslinje: forløpet er bevisst
 * utelatt for å teste om «hva gjør jeg nå» alene er nok for leder.
 */
export function VariantA(): ReactElement {
  const { fokusAnsatt, dm1For } = usePrototype();
  const [dialogApen, setDialogApen] = useState(false);
  const dm1 = dm1For(fokusAnsatt.id);
  const aktuelt = utledAktueltNa(fokusAnsatt, dm1);
  const tidslinje = utledTidslinje(fokusAnsatt, dm1);

  const krevErStatusHandling =
    aktuelt.handling.id === "registrer-dm1" ||
    aktuelt.handling.id === "endre-dm1";

  /** Det som ligger foran, komprimert til korte linjer. Fortid hører hjemme i
      historikken, ikke i en liste over hva som er aktuelt. */
  const restenAvBildet: Hendelse[] = tidslinje
    .filter((h) => !erFortid(h) && h.handling?.id !== aktuelt.handling.id)
    .slice(0, 3);

  return (
    <VStack gap="space-32">
      <VStack gap="space-8">
        <Heading size="xlarge" level="1">
          {fokusAnsatt.navn}
        </Heading>
        <BodyShort textColor="subtle">{fokusAnsatt.situasjon}</BodyShort>
      </VStack>

      <AktueltNaBlokk
        aktuelt={aktuelt}
        onHandling={
          krevErStatusHandling ? () => setDialogApen(true) : undefined
        }
      >
        {krevErStatusHandling && (
          <Detail>
            Du legger inn din egen opplysning. Nav får den ikke, og
            {` ${fokusAnsatt.navn.split(" ")[0]} `}
            varsles ikke.
          </Detail>
        )}
      </AktueltNaBlokk>

      {aktuelt.handling.id === "forbered-dm1" && (
        <ForberedelseKort ansatt={fokusAnsatt} apenSomStandard />
      )}

      {restenAvBildet.length > 0 && (
        <VStack gap="space-12">
          <Heading size="small" level="2">
            Dette kommer
          </Heading>
          <VStack gap="space-8">
            {restenAvBildet.map((hendelse) => (
              <Box
                key={hendelse.id}
                borderWidth="0 0 0 4"
                borderColor="neutral-subtle"
                paddingInline="space-16 space-0"
                paddingBlock="space-4"
              >
                <VStack gap="space-4">
                  <BodyShort size="small" weight="semibold">
                    {hendelse.tittel}
                  </BodyShort>
                  <Detail textColor="subtle">
                    {hendelse.datoTekst ??
                      (hendelse.dato ? formatDato(hendelse.dato) : "")}
                  </Detail>
                </VStack>
              </Box>
            ))}
          </VStack>
          <Detail textColor="subtle">
            Dette er tidspunkter i oppfølgingen, ikke avtaler som er satt. Du
            trenger ikke gjøre noe med dem nå.
          </Detail>
        </VStack>
      )}

      <Dm1StatusKort ansatt={fokusAnsatt} />

      <VidereAvtale ansatt={fokusAnsatt} />

      <ReadMore header={`Om situasjonen til ${fokusAnsatt.navn.split(" ")[0]}`}>
        <VStack gap="space-16" paddingBlock="space-12 space-0">
          <BodyLong size="small">
            Opplysningene under endrer seg gjennom forløpet. De er tatt med for
            at du skal kunne se sammenhengen, ikke fordi du må gjøre noe med
            dem.
          </BodyLong>
          <Nokkelinfo ansatt={fokusAnsatt} />
        </VStack>
      </ReadMore>

      <DokumenterOgHistorikk ansatt={fokusAnsatt} />

      <Dm1StatusDialog
        ansatt={fokusAnsatt}
        apen={dialogApen}
        lukk={() => setDialogApen(false)}
      />
    </VStack>
  );
}
