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
    tittel: "Hold kontakten",
    tidspunkt: "Fra første dag",
    overskrift: "Hold kontakten",
    avsnitt: [
      "Ta kontakt tidlig, og hold jevnlig kontakt gjennom hele sykefraværet. Snakk om hva den ansatte kan gjøre, og hva som kan gjøre det mulig å jobbe, helt eller delvis. Du har ikke krav på å vite diagnosen. Tilrettelegg så langt det er mulig, for eksempel med tilpasset arbeidstid, hjelpemidler eller andre oppgaver.",
      "Den ansatte har også ansvar for å bidra, så dere sammen finner løsninger som fungerer.",
    ],
    hvorfor:
      "Din innsats kan være avgjørende for at den ansatte kommer tilbake i jobb. Tidlig kontakt viser også at arbeidsplassen bryr seg.",
    lenker: [
      {
        lenke: "tilrettelegging",
        href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#tilrettelegging",
        tekst: "Om tilrettelegging på nav.no",
      },
      {
        lenke: "samtalestotte",
        href: "https://idebanken.no/folge-opp-sykefravaer/samtaler-ved-sykefravaer",
        tekst: "Samtalestøtte på idebanken.no",
      },
    ],
  },
  {
    fane: "oppfolgingsplan",
    tittel: "Oppfølgingsplan",
    tidspunkt: "Innen 4 uker",
    overskrift: "Lag oppfølgingsplanen sammen",
    avsnitt: [
      "Planen skal være klar senest innen 4 uker. Skriv ned hva den ansatte kan gjøre, hva som må tilrettelegges og hva dere avtaler. Målet er å finne løsninger som passer den ansattes situasjon og det arbeidsplassen kan tilrettelegge. Send planen til legen.",
    ],
    hvorfor:
      "Når dere har en felles plan, vet begge hva dere prøver ut, og det er lettere å justere underveis.",
    lenker: [
      {
        lenke: "oppfolgingsplan",
        href: "https://www.nav.no/arbeidsgiver/oppfolgingsplan",
        tekst: "Om oppfølgingsplan på nav.no",
      },
    ],
  },
  {
    fane: "dialogmote_1",
    tittel: "Dialogmøte 1",
    tidspunkt: "Innen 7 uker",
    overskrift: "Hold dialogmøte 1",
    avsnitt: [
      "Dialogmøte 1 er et møte mellom deg og den ansatte om hvordan den ansatte kan være i jobb. Dere går gjennom oppfølgingsplanen og oppdaterer den.",
      "Dere skal ha møtet hvis den ansatte er 100 prosent sykmeldt, eller hvis du eller den ansatte ønsker det. Den ansatte bestemmer om legen skal være med. Nav er ikke med i dette møtet.",
    ],
    hvorfor:
      "Den ansatte kjenner jobben og sin egen situasjon best. Sammen finner dere ofte løsninger.",
    lenker: [
      {
        lenke: "slik_dialogmote_1",
        href: "https://www.nav.no/dialogmote#dialogmote-1",
        tekst: "Slik gjennomfører dere dialogmøte 1",
      },
      {
        lenke: "om_dialogmote",
        href: "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-1",
        tekst: "Om dialogmøte på nav.no",
      },
    ],
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
