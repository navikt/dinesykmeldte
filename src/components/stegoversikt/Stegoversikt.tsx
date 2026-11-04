"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  TasklistIcon,
} from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Link,
  Tabs,
  VStack,
} from "@navikt/ds-react";
import { BreakpointMdDown } from "@navikt/ds-tokens/js";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import {
  recordStegoversiktLinkClick,
  recordStegoversiktTabSelected,
  recordStegoversiktToggle,
  STEGOVERSIKT_FANER,
  type StegoversiktFane,
  useStegoversiktTelemetry,
} from "./stegoversiktTelemetry";

const CONTENT_ID = "stegoversikt-innhold";

function Stegoversikt({
  gruppe,
}: {
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] =
    useState<StegoversiktFane>("hold_kontakten");
  const elementRef = useStegoversiktTelemetry(gruppe);

  useEffect(() => {
    const smalSkjerm =
      typeof window.matchMedia === "function" &&
      window.matchMedia(`(max-width: ${BreakpointMdDown})`).matches;
    setOpen(!smalSkjerm);
  }, []);

  return (
    <Box
      as="section"
      aria-labelledby="stegoversikt-heading"
      marginBlock="space-0 space-24"
      ref={elementRef}
    >
      <Box
        background="neutral-soft"
        borderRadius="12"
        paddingBlock={{ xs: "space-16", md: "space-24" }}
        paddingInline={{ xs: "space-16", md: "space-24" }}
      >
        <VStack gap="space-16">
          <HStack align="start" justify="space-between" gap="space-16">
            <HStack align="start" gap="space-12" wrap={false}>
              <TasklistIcon
                aria-hidden
                className="text-ax-text-accent"
                fontSize="1.5rem"
              />
              <Heading level="2" size="medium" id="stegoversikt-heading">
                De første ukene av sykefraværet
              </Heading>
            </HStack>
            <Button
              aria-controls={CONTENT_ID}
              aria-expanded={open}
              onClick={() => {
                const nextOpen = !open;
                recordStegoversiktToggle(gruppe, nextOpen);
                setOpen(nextOpen);
              }}
              size="small"
              variant="tertiary"
              icon={
                open ? (
                  <ChevronUpIcon aria-hidden />
                ) : (
                  <ChevronDownIcon aria-hidden />
                )
              }
              iconPosition="right"
            >
              Hva du skal gjøre
            </Button>
          </HStack>

          <BodyLong>
            Dette er de viktigste oppfølgingspunktene. Dialog på arbeidsplassen
            gjør det lettere for den ansatte å komme tilbake i jobb.
          </BodyLong>

          <div id={CONTENT_ID} hidden={!open}>
            <Box
              background="default"
              borderRadius="8"
              paddingBlock="space-16"
              paddingInline={{ xs: "space-16", md: "space-24" }}
            >
              <Tabs
                value={selectedTab}
                onChange={(value) => {
                  const fane = STEGOVERSIKT_FANER.find((it) => it === value);
                  if (fane) {
                    setSelectedTab(fane);
                    recordStegoversiktTabSelected(gruppe, fane);
                  }
                }}
                size="small"
              >
                <Tabs.List aria-label="Oppfølgingspunkter">
                  <Tabs.Tab
                    value="hold_kontakten"
                    label={
                      <TabLabel title="Hold kontakten" time="Fra første dag" />
                    }
                  />
                  <Tabs.Tab
                    value="oppfolgingsplan"
                    label={
                      <TabLabel title="Oppfølgingsplan" time="Innen 4 uker" />
                    }
                  />
                  <Tabs.Tab
                    value="dialogmote_1"
                    label={
                      <TabLabel title="Dialogmøte 1" time="Innen 7 uker" />
                    }
                  />
                  <Tabs.Tab
                    value="krav_om_aktivitet"
                    label={
                      <TabLabel title="Krav om aktivitet" time="Ved 8 uker" />
                    }
                  />
                </Tabs.List>

                <Tabs.Panel value="hold_kontakten">
                  <VStack gap="space-16" paddingBlock="space-16 space-0">
                    <Heading level="3" size="small">
                      Hold kontakten
                    </Heading>
                    <BodyLong>
                      Ta kontakt tidlig, og hold jevnlig kontakt gjennom hele
                      sykefraværet. Snakk om hva den ansatte kan gjøre, og hva
                      som kan gjøre det mulig å jobbe, helt eller delvis. Du har
                      ikke krav på å vite diagnosen. Tilrettelegg så langt det
                      er mulig, for eksempel med tilpasset arbeidstid,
                      hjelpemidler eller andre oppgaver.
                    </BodyLong>
                    <BodyLong>
                      Den ansatte har også ansvar for å bidra, så dere sammen
                      finner løsninger som fungerer.
                    </BodyLong>
                    <Why>
                      Din innsats kan være avgjørende for at den ansatte kommer
                      tilbake i jobb. Tidlig kontakt viser også at
                      arbeidsplassen bryr seg.
                    </Why>
                    <VStack gap="space-8">
                      <Link
                        href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#tilrettelegging"
                        onClick={() =>
                          recordStegoversiktLinkClick(
                            gruppe,
                            "tilrettelegging",
                            selectedTab,
                          )
                        }
                      >
                        Om tilrettelegging på nav.no
                      </Link>
                      <Link
                        href="https://idebanken.no/folge-opp-sykefravaer/samtaler-ved-sykefravaer"
                        onClick={() =>
                          recordStegoversiktLinkClick(
                            gruppe,
                            "samtalestotte",
                            selectedTab,
                          )
                        }
                      >
                        Samtalestøtte på idebanken.no
                      </Link>
                    </VStack>
                  </VStack>
                </Tabs.Panel>

                <Tabs.Panel value="oppfolgingsplan">
                  <VStack gap="space-16" paddingBlock="space-16 space-0">
                    <Heading level="3" size="small">
                      Lag oppfølgingsplanen sammen
                    </Heading>
                    <BodyLong>
                      Planen skal være klar senest innen 4 uker. Skriv ned hva
                      den ansatte kan gjøre, hva som må tilrettelegges og hva
                      dere avtaler. Målet er å finne løsninger som passer den
                      ansattes situasjon og det arbeidsplassen kan
                      tilrettelegge. Send planen til legen.
                    </BodyLong>
                    <Why>
                      Når dere har en felles plan, vet begge hva dere prøver ut,
                      og det er lettere å justere underveis.
                    </Why>
                    <Link
                      href="https://www.nav.no/arbeidsgiver/oppfolgingsplan"
                      onClick={() =>
                        recordStegoversiktLinkClick(
                          gruppe,
                          "oppfolgingsplan",
                          selectedTab,
                        )
                      }
                    >
                      Om oppfølgingsplan på nav.no
                    </Link>
                  </VStack>
                </Tabs.Panel>

                <Tabs.Panel value="dialogmote_1">
                  <VStack gap="space-16" paddingBlock="space-16 space-0">
                    <Heading level="3" size="small">
                      Hold dialogmøte 1
                    </Heading>
                    <BodyLong>
                      Dialogmøte 1 er et møte mellom deg og den ansatte om
                      hvordan den ansatte kan være i jobb. Dere går gjennom
                      oppfølgingsplanen og oppdaterer den.
                    </BodyLong>
                    <BodyLong>
                      Dere skal ha møtet hvis den ansatte er 100 prosent
                      sykmeldt, eller hvis du eller den ansatte ønsker det. Den
                      ansatte bestemmer om legen skal være med. Nav er ikke med
                      i dette møtet.
                    </BodyLong>
                    <Why>
                      Den ansatte kjenner jobben og sin egen situasjon best.
                      Sammen finner dere ofte løsninger.
                    </Why>
                    <VStack gap="space-8">
                      <Link
                        href="https://www.nav.no/dialogmote#dialogmote-1"
                        onClick={() =>
                          recordStegoversiktLinkClick(
                            gruppe,
                            "slik_dialogmote_1",
                            selectedTab,
                          )
                        }
                      >
                        Slik gjennomfører dere dialogmøte 1
                      </Link>
                      <Link
                        href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-1"
                        onClick={() =>
                          recordStegoversiktLinkClick(
                            gruppe,
                            "om_dialogmote",
                            selectedTab,
                          )
                        }
                      >
                        Om dialogmøte på nav.no
                      </Link>
                    </VStack>
                  </VStack>
                </Tabs.Panel>

                <Tabs.Panel value="krav_om_aktivitet">
                  <VStack gap="space-16" paddingBlock="space-16 space-0">
                    <Heading level="3" size="small">
                      Nav vurderer aktivitet
                    </Heading>
                    <BodyLong>
                      Den ansatte skal som hovedregel prøve seg i arbeid, helt
                      eller delvis. Ved 8 uker vurderer Nav om den ansatte bør
                      være i aktivitet. Hvis helsen hindrer aktivitet, kan den
                      ansatte være unntatt.
                    </BodyLong>
                    <BodyLong>
                      Du kan gi Nav et bedre grunnlag for vurderingen. Del en
                      oppdatert oppfølgingsplan som viser hva dere har prøvd, og
                      hva arbeidsplassen kan tilrettelegge.
                    </BodyLong>
                    <Why>
                      Du kjenner arbeidsplassen best. Når Nav vet hva som er
                      mulig hos dere, kan vurderingen bli mer riktig for den
                      ansatte. Trenger dere hjelp, kan du når som helst be om
                      dialogmøte med Nav.
                    </Why>
                  </VStack>
                </Tabs.Panel>
              </Tabs>
            </Box>
          </div>
        </VStack>
      </Box>
    </Box>
  );
}

function TabLabel({
  title,
  time,
}: {
  readonly title: string;
  readonly time: string;
}): ReactElement {
  return (
    <VStack as="span">
      <BodyShort as="span" size="small" weight="semibold">
        {title}
      </BodyShort>
      <Detail as="span">{time}</Detail>
    </VStack>
  );
}

function Why({ children }: { readonly children: string }): ReactElement {
  return (
    <Box
      borderColor="neutral-subtle"
      borderWidth="0 0 0 4"
      paddingInline="space-12"
    >
      <VStack gap="space-4">
        <BodyShort weight="semibold">Hvorfor er det verdt det?</BodyShort>
        <BodyLong>{children}</BodyLong>
      </VStack>
    </Box>
  );
}

export default Stegoversikt;
