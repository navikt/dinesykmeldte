import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import { BodyLong, BodyShort, Link } from "@navikt/ds-react";
import type { Metadata } from "next";
import ExpandableInfo from "../../../components/MarkdownPage/components/ExpandableInfo";
import Timeline, {
  TimelineEntry,
} from "../../../components/MarkdownPage/components/Timeline";
import { OppfolgingBreadcrumbs } from "./OppfolgingBreadcrumbs";

export const metadata: Metadata = {
  title: "Oppfølging underveis i sykefraværet | Dine sykmeldte",
};

export default function OppfolgingPage() {
  return (
    <>
      <OppfolgingBreadcrumbs />
      <PageContainer header={{ title: "Oppfølging underveis i sykefraværet" }}>
        <Timeline>
          <TimelineEntry icon="BandageFilled">
            Sykefraværet starter
          </TimelineEntry>

          <ExpandableInfo title="Snakk med den ansatte" icon="Dialog">
            <BodyLong spacing>
              Som arbeidsgiver skal du sammen med den ansatte vurdere om det er
              mulig å delta i noe arbeid på tross av sykdom. Jo tidligere du
              kommer i gang med å følge opp den ansatte, desto større er
              sannsynligheten for at dere unngår at sykefraværet blir unødvendig
              langt.
            </BodyLong>
            <ul className="ml-4 list-disc">
              <li>
                <BodyShort>
                  Er det noen arbeidsoppgaver det fortsatt er mulig å utføre?
                </BodyShort>
              </li>
              <li>
                <BodyShort>
                  Kan du tilrettelegge arbeidsplassen eller arbeidstiden?
                </BodyShort>
              </li>
              <li>
                <BodyShort>
                  Kan den ansatte være delvis i arbeid og få gradert sykmelding?
                </BodyShort>
              </li>
            </ul>
            <BodyShort spacing>
              Flere råd til samtalen finner du via{" "}
              <Link
                href="https://www.nav.no/arbeidsgiver/samtalestotte-arbeidsgiver"
                target="_blank"
                rel="noopener noreferrer"
              >
                samtalestøtten for arbeidsgiver
              </Link>
              .
            </BodyShort>
            <BodyLong spacing>
              På{" "}
              <Link
                href="https://www.idebanken.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Idebanken
              </Link>{" "}
              finner du gode tips og eksempler som du kan bruke i ditt eget
              arbeid med sykmeldte ansatte. Se også{" "}
              <Link
                href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#hvem"
                target="_blank"
                rel="noopener noreferrer"
              >
                hvem som gjør hva
              </Link>{" "}
              i sykefraværsarbeidet.
            </BodyLong>
          </ExpandableInfo>

          <TimelineEntry icon="BellFilled">
            Innen 4 uker:{" "}
            <Link
              href="https://www.nav.no/arbeidsgiver/oppfolgingsplan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Oppfølgingsplanen
            </Link>{" "}
            må være ferdig
          </TimelineEntry>

          <ExpandableInfo
            title="Forbered deg på dialogmøte med den ansatte"
            icon="CoApplicant"
          >
            <BodyLong spacing>
              Som arbeidsgiver har du ansvar for å innkalle den ansatte til et
              dialogmøte for å diskutere muligheter og begrensninger videre.
              Hvis dere allerede har laget en oppfølgingsplan, er det viktig å
              diskutere om planen fungerer eller om den bør endres.
            </BodyLong>
            <BodyLong spacing>
              Dialogmøtet skal holdes innen 7 uker. Ved alvorlig sykdom og
              enkelte andre situasjoner er det unntak fra å avholde møte.
            </BodyLong>
          </ExpandableInfo>

          <TimelineEntry icon="BellFilled">
            Innen 7 uker:{" "}
            <Link
              href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dialogmøte på arbeidsplassen
            </Link>
          </TimelineEntry>

          <ExpandableInfo title="NAV vurderer aktivitetsplikten" icon="Findout">
            <BodyLong spacing>
              NAV har som oppgave å vurdere om den ansatte fyller kravene til
              aktivitet og fortsatt har rett til sykepenger. Den som sykmelder
              den ansatte skal gi NAV informasjon hvis medisinske forhold gjør
              at det ikke er mulig for den ansatte å være i aktivitet. Ved
              alvorlig sykdom er det unntak fra aktivitetsplikten. Det er også
              unntak hvis arbeidsplassen ikke kan legge til rette for aktivitet.
              Da må du som arbeidsgiver dokumentere dette i oppfølgingsplanen
              som sendes til NAV.
            </BodyLong>
            <BodyShort spacing>
              <Link
                href="https://www.nav.no/sykepenger#ditt-ansvar"
                target="_blank"
                rel="noopener noreferrer"
              >
                Se hva vi sier til den ansatte om aktivitetsplikten.
              </Link>
            </BodyShort>
          </ExpandableInfo>

          <TimelineEntry icon="TaskFilled">
            Innen 8 uker: Aktivitetsplikten er ferdig vurdert
          </TimelineEntry>

          <ExpandableInfo
            title="Forbered deg på dialogmøte med NAV"
            icon="CoApplicant"
          >
            <BodyLong spacing>
              Som arbeidsgiver har du rett og plikt til å delta i dialogmøte med
              NAV sammen med den ansatte. Den som sykmelder den ansatte kan også
              delta. Hensikten er å gå gjennom situasjonen og planlegge videre
              aktiviteter. Hvis du ikke har fått innkalling til dialogmøte, kan
              du{" "}
              <Link
                href="https://www.nav.no/arbeidsgiver/kontaktoss/"
                target="_blank"
                rel="noopener noreferrer"
              >
                kontakte NAV
              </Link>{" "}
              hvis du ønsker et møte.
            </BodyLong>
            <BodyShort spacing>
              <Link
                href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dialogmøte i regi av NAV
              </Link>{" "}
              skal holdes senest innen 26 uker, eller tidligere hvis det er
              behov for det.
            </BodyShort>
          </ExpandableInfo>

          <TimelineEntry icon="BandageFilled">
            Innen 26 uker:{" "}
            <Link
              href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dialogmøte med NAV
            </Link>
          </TimelineEntry>

          <ExpandableInfo
            title="Når den ansatte blir langtidssykmeldt"
            icon="Calendar"
          >
            <BodyLong spacing>
              Hvis det er avholdt et dialogmøte i regi av NAV, er det viktig at
              du følger opp det som ble avtalt i møtet. Det er ingen faste
              milepæler i denne fasen, og planene avhenger av hvilken aktivitet
              som er mulig ut fra helsesituasjonen. Som arbeidsgiver har du
              fortsatt et oppfølgingsansvar. Det er mulig å be NAV om et{" "}
              <Link
                href="https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3"
                target="_blank"
                rel="noopener noreferrer"
              >
                nytt dialogmøte
              </Link>{" "}
              sammen med den ansatte og eventuelt den som sykmelder.
            </BodyLong>
          </ExpandableInfo>

          <ExpandableInfo
            title="Hva skjer i sluttfasen av sykefraværet?"
            icon="Sandglass"
          >
            <BodyLong spacing>
              Retten til sykepenger opphører etter 52 ukers sykefravær. Når
              sykmeldingen har vart i 39 uker, får den ansatte et
              informasjonsbrev fra NAV. Brevet handler om hva som skjer når
              sykefraværet nærmer seg denne grensen. Den ansatte får samtidig
              vite at det er mulig å be om et nytt dialogmøte eller en
              individuell samtale med en veileder på NAV-kontoret. Også du som
              arbeidsgiver kan be NAV om et nytt dialogmøte hvis du ser behov
              for det.
            </BodyLong>
            <BodyShort spacing>
              Les mer om overgangen{" "}
              <Link
                href="https://www.nav.no/sykepenger#snart-slutt"
                target="_blank"
                rel="noopener noreferrer"
              >
                fra sykepenger til arbeidsavklaringspenger
              </Link>
              .
            </BodyShort>
          </ExpandableInfo>

          <TimelineEntry icon="SuccessFilled" last>
            52 uker: Retten til sykepenger opphører
          </TimelineEntry>
        </Timeline>
      </PageContainer>
    </>
  );
}
