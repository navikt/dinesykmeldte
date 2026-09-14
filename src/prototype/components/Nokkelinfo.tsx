"use client";

import {
  Buildings2Icon,
  CalendarIcon,
  HeartIcon,
  PersonIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Detail,
  Heading,
  HGrid,
  HStack,
  VStack,
} from "@navikt/ds-react";
import type { ReactElement } from "react";
import type { Ansatt } from "../types";
import { formatDato, formatTall } from "../utils/format";
import { gjeldendePeriode, ukerISykefravaer } from "../utils/oppfolging";

interface Props {
  ansatt: Ansatt;
  /** Sent i forløpet fortjener sykepengeopplysningene mer vekt. */
  fremhevSykepenger?: boolean;
}

function Opplysning({
  ikon,
  tittel,
  verdi,
  presisering,
}: {
  ikon: ReactElement;
  tittel: string;
  verdi: string;
  presisering?: string;
}): ReactElement {
  return (
    <VStack gap="space-4">
      <HStack gap="space-8" align="center">
        {ikon}
        <Detail textColor="subtle">{tittel}</Detail>
      </HStack>
      <BodyShort weight="semibold">{verdi}</BodyShort>
      {presisering && <Detail textColor="subtle">{presisering}</Detail>}
    </VStack>
  );
}

/**
 * Nøkkelopplysningene leder trenger for å forstå situasjonen. Sykmeldingsgrad og
 * forløpslengde regnes fra forløpets start, ikke fra siste sykmeldingsdokument.
 */
export function Nokkelinfo({
  ansatt,
  fremhevSykepenger = false,
}: Props): ReactElement {
  const periode = gjeldendePeriode(ansatt);
  const uker = ukerISykefravaer(ansatt);

  return (
    <Box
      background="neutral-soft"
      borderRadius="12"
      padding="space-20"
      aria-label={`Nøkkelopplysninger om ${ansatt.navn}`}
    >
      <VStack gap="space-16">
        <HGrid gap="space-20" columns={{ xs: 1, sm: 2, lg: 4 }}>
          <Opplysning
            ikon={<HeartIcon aria-hidden />}
            tittel="Sykmeldingsgrad nå"
            verdi={`${periode.grad} %`}
            presisering={`Til ${formatDato(periode.tom)}`}
          />
          <Opplysning
            ikon={<CalendarIcon aria-hidden />}
            tittel="Forløpet startet"
            verdi={formatDato(ansatt.forlopStart)}
            presisering={`${uker} uker med oppfølging${ansatt.perioder.length > 1 ? `, ${ansatt.perioder.length} sykmeldinger` : ""}`}
          />
          <Opplysning
            ikon={<PersonIcon aria-hidden />}
            tittel="Fødselsnummer"
            verdi={ansatt.fnrMaskert}
            presisering="Fiktivt testnummer"
          />
          <Opplysning
            ikon={<Buildings2Icon aria-hidden />}
            tittel={ansatt.orgnavn}
            verdi={`Org.nr. ${ansatt.orgnummer}`}
          />
        </HGrid>

        {ansatt.sykepenger && (
          <Box
            background={fremhevSykepenger ? "warning-soft" : "default"}
            borderRadius="8"
            padding="space-16"
          >
            <VStack gap="space-8">
              <Heading size="xsmall" level="3">
                Sykepengeperioden
              </Heading>
              <HGrid gap="space-20" columns={{ xs: 1, sm: 2 }}>
                <Opplysning
                  ikon={<CalendarIcon aria-hidden />}
                  tittel="Maksdato"
                  verdi={formatDato(ansatt.sykepenger.maksdato)}
                />
                <Opplysning
                  ikon={<CalendarIcon aria-hidden />}
                  tittel="Gjenstående dager"
                  verdi={formatTall(ansatt.sykepenger.gjenstaendeDager)}
                />
              </HGrid>
              <Detail>
                {ansatt.sykepenger.erAnslag
                  ? "Dette er et anslag ut fra opplysningene nå. Det endrer seg hvis sykmeldingsgraden eller andre opplysninger endres."
                  : "Beregnet ut fra opplysningene Nav har nå."}
              </Detail>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
