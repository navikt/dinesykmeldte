import { BodyShort, Detail, Tabs, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { useState } from "react";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import StegPanel, { type Steg } from "./StegPanel";
import {
  recordStegoversiktTabSelected,
  STEGOVERSIKT_FANER,
  type StegoversiktFane,
} from "./stegoversiktTelemetry";

const STEGOVERSIKT_STEG: readonly Steg[] = [
  {
    fane: "hold_kontakten",
    tittel: "Ta kontakt",
    tidspunkt: "Fra første dag",
    overskrift: "Ta kontakt",
    innhold: [
      {
        type: "liste",
        punkter: [
          "Ta kontakt med den som er sykmeldt i løpet av de første dagene.",
          "Spør hva du kan gjøre, og hvor lenge arbeidstakeren din tror sykefraværet vil vare.",
          "Du trenger ikke vite diagnosen for å hjelpe, men du kan spørre om fraværet er arbeidsrelatert.",
          "Det er lurt å bli enige om hvor ofte og hvordan dere har kontakt videre.",
        ],
      },
    ],
    hvorfor:
      "Vi vet at jo lenger et sykefravær varer, desto vanskeligere er det å komme tilbake. Tidlig og jevnlig kontakt kan bidra til at fraværet ikke blir lenger enn nødvendig. Det viser at du bryr deg.",
    lenker: [
      {
        lenke: "samtalestotte",
        href: "https://idebanken.no/folge-opp-sykefravaer/samtaler-ved-sykefravaer",
        tekst: "Samtalestøtte på idebanken.no",
      },
    ],
  },
  {
    fane: "oppfolgingsplan",
    tittel: "Lag en oppfølgingsplan",
    tidspunkt: "Innen 4 uker",
    overskrift: "Lag oppfølgingsplan",
    innhold: [
      {
        type: "avsnitt",
        tekst:
          "Lag en oppfølgingsplan sammen senest innen fire uker. Det viktigste den bør inneholde er:",
      },
      {
        type: "liste",
        punkter: [
          "Hva arbeidstakeren din kan gjøre",
          "Hvordan du kan tilrettelegge best mulig (for eksempel tilpasset arbeidstid, hjelpemidler eller andre oppgaver).",
          "Hva dere avtaler, og gjerne hvem som gjør hva videre",
        ],
      },
      {
        type: "avsnitt",
        tekst:
          "Sett en dato for når dere skal se på planen igjen (dialogmøte 1) og send til legen når den er klar.",
      },
    ],
    hvorfor:
      "En skriftlig plan laget av begge er lettere å følge opp enn en muntlig avtale. Dere vet da helt konkret hva dere ønsker å få til og det blir enklere å justere underveis.",
    lenker: [],
  },
  {
    fane: "dialogmote_1",
    tittel: "Hold dialogmøte 1",
    tidspunkt: "Innen 7 uker",
    overskrift: "Hold dialogmøte 1",
    innhold: [
      {
        type: "avsnitt",
        tekst:
          "Som arbeidsgiver har du ansvar for å kalle inn til dialogmøte 1. Hovedmålet er at dere sammen går gjennom oppfølgingsplanen og oppdaterer den.",
      },
      {
        type: "liste",
        punkter: [
          "Dialogmøte 1 er obligatorisk når arbeidstakeren din er 100% sykmeldt. Ved gradert sykmelding holder dere møtet hvis en ønsker det.",
          "Har noe endret seg og er det nye tilretteleggingsmuligheter.",
          "Arbeidstakeren din velger om den som sykmelder skal være med. Nav er som hovedregel ikke med i dette møtet.",
          "Husk å dokumentere endringene dere gjør og hvem som deltok i møtet.",
        ],
      },
      {
        type: "avsnitt",
        tekst:
          "Arbeidstakeren din har også et ansvar om å bidra (Medvirkningsplikten).",
      },
    ],
    hvorfor:
      "Dialogmøte 1 er en anledning til å snakke om hvordan tilretteleggingen fungerer i praksis, og hva som eventuelt må endres for at den som er sykmeldt skal komme tilbake igjen i jobb (helt eller delvis).",
    lenker: [],
  },
];

function StegoversiktFaner({
  gruppe,
}: {
  readonly gruppe: Tildelingsgruppe;
}): ReactElement {
  const [valgtFane, setValgtFane] =
    useState<StegoversiktFane>("hold_kontakten");

  return (
    <Tabs
      value={valgtFane}
      onChange={(value) => {
        const fane = STEGOVERSIKT_FANER.find((it) => it === value);
        if (fane) {
          setValgtFane(fane);
          recordStegoversiktTabSelected(gruppe, fane);
        }
      }}
      size="small"
      fill
    >
      <Tabs.List aria-label="Oppfølgingspunkter">
        {STEGOVERSIKT_STEG.map(({ fane, tittel, tidspunkt }) => (
          <Tabs.Tab
            key={fane}
            value={fane}
            label={
              <VStack as="span">
                <BodyShort as="span" size="small" weight="semibold">
                  {tittel}
                </BodyShort>
                <Detail as="span">{tidspunkt}</Detail>
              </VStack>
            }
          />
        ))}
      </Tabs.List>
      {STEGOVERSIKT_STEG.map((steg) => (
        <Tabs.Panel key={steg.fane} value={steg.fane}>
          <StegPanel steg={steg} gruppe={gruppe} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

export default StegoversiktFaner;
