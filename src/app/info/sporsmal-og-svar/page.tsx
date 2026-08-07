import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import { BodyLong, BodyShort, Heading, Link } from "@navikt/ds-react";
import type { Metadata } from "next";
import KontaktInfoPanel from "../../../components/MarkdownPage/components/KontaktInfoPanel";
import SporsmalOgSvarWrapper from "../../../components/MarkdownPage/components/SporsmalOgSvarWrapper";
import TilbakeLink from "../../../components/shared/TilbakeLink/TilbakeLink";
import { SporsmalOgSvarBreadcrumbs } from "./SporsmalOgSvarBreadcrumbs";

export const metadata: Metadata = {
  title: "Spørsmål og svar om dine sykmeldte | Dine sykmeldte",
};

export default function SporsmalOgSvarPage() {
  return (
    <>
      <SporsmalOgSvarBreadcrumbs />
      <PageContainer header={{ title: "Spørsmål og svar om dine sykmeldte" }}>
        <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" />

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hvordan har NAV fått navnet mitt?
          </Heading>
          <BodyShort spacing>
            Opplysningene om hvem du er leder for kommer fra virksomheten du
            jobber i og er lagt inn av den som henter sykmeldingene i Altinn.
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hvorfor vises ikke informasjonen mer enn fire måneder?
          </Heading>
          <BodyLong spacing>
            Av personvernhensyn kan vi ikke vise dokumenter på nav.no lenger enn
            fire måneder etter at den ansatte har blitt frisk. Dere finner alle
            sykmeldinger og søknader i Altinn.
          </BodyLong>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Jeg savner noen sykmeldinger i listen
          </Heading>
          <BodyShort spacing>
            Du får de sykmeldingene som dine ansatte har sendt digitalt.
          </BodyShort>
          <BodyLong spacing>
            Noen vil fortsatt få sykmeldingen på papir. Sykehusene skriver
            foreløpig ikke ut sykmeldinger som kan sendes digitalt.
          </BodyLong>
          <BodyShort spacing>
            Det kan også være andre grunner til at noen av dine ansatte må ha
            (eller vil ha) sykmeldingen på papir.
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hva skal jeg gjøre med det som ligger i listen?
          </Heading>
          <ul className="ml-4 list-disc">
            <li>
              <BodyShort>
                Du leser innholdet i sykmeldingen, og starter oppfølgingen av
                den ansatte hvis det er behov for det.
              </BodyShort>
            </li>
            <li>
              <BodyLong>
                I søknaden kontrollerer du opplysningene som er gitt. Oppdager
                du feil, må du be den ansatte rette det opp i Ditt sykefravær på
                nav.no.
              </BodyLong>
            </li>
            <li>
              <BodyLong>
                I den digitale oppfølgingsplanen kan du og den ansatte skrive
                inn arbeidsoppgaver og forslag til tiltak fra hver deres kant,
                eller dere kan skrive den når dere sitter sammen.
              </BodyLong>
            </li>
            <li>
              <BodyShort>
                I de digitale møteforespørslene svarer du på hvilke datoer som
                passer for deg.
              </BodyShort>
            </li>
          </ul>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hvordan kan jeg styre hvilke varsler jeg får på SMS og e-post?
          </Heading>
          <BodyShort spacing>
            Noen av varslene kan du velge om du vil ha, og du kan bestemme
            hvilken adresse de skal komme til. Les mer her:{" "}
            <Link
              href="https://www.nav.no/arbeidsgiver/tilganger#varsling"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hvordan styre varsel på SMS og e-post
            </Link>
            .
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hva gjør jeg hvis jeg ikke er leder?
          </Heading>
          <BodyLong spacing>
            Den ansatte får spørsmål om det er riktig at du er lederen. Dette
            skjer neste gang den ansatte sender en sykmelding.
          </BodyLong>
          <BodyShort spacing>
            Hvis svaret er nei, sletter vi navnet ditt og spør virksomheten på
            nytt i Altinn dersom den ansatte fortsatt er en del av virksomheten.
          </BodyShort>
          <BodyShort spacing>
            Den ansatte kan når som helst sjekke hvem som er meldt inn som
            nærmeste leder ved å logge inn på Ditt sykefravær på nav.no.
          </BodyShort>
          <BodyLong spacing>
            Du kan også melde fra om at du ikke lenger er lederen. Når du har
            trykket på navnet i listen, bruker du lenken «melde fra om endring
            til NAV» nederst på siden.
          </BodyLong>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Må jeg gi søknaden videre til personal- eller lønnsavdelingen?
          </Heading>
          <BodyShort spacing>Nei, de kan finne den i Altinn.</BodyShort>
          <BodyShort spacing>
            Trenger jeg å bruke del D av sykmeldingen på papir?
          </BodyShort>
          <BodyShort spacing>
            Nei, hvis den ansatte har brukt den digitale søknaden om sykepenger,
            skal del D på papir ikke brukes.
          </BodyShort>
          <BodyShort spacing>
            NAV saksbehandler den digitale søknaden supplert med
            inntektsopplysningsskjemaet, som er det eneste dere skal sende i
            tillegg.
          </BodyShort>
          <BodyShort spacing>
            Hvis den ansatte ikke bruker digital sykmelding, sender du del D til{" "}
            <Link
              href="https://www.nav.no/no/nav-og-samfunn/samarbeid/leger-og-andre-behandlere/relatert-innhold/adresser-til-nav-arbeid-og-ytelser-for-krav-om-sykepenger"
              target="_blank"
              rel="noopener noreferrer"
            >
              NAV i posten
            </Link>
            .
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hva gjør jeg hvis den ansatte har fylt ut søknaden om sykepenger
            feil?
          </Heading>
          <BodyShort spacing>
            Da tar du kontakt med den ansatte, som selv har mulighet til å rette
            opp søknaden på sin side på nav.no.
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hvordan kan jeg skrive ut sykmeldingen eller søknaden?
          </Heading>
          <BodyShort spacing>
            I utgangspunktet skal det ikke være behov for å skrive ut
            dokumentene fordi de ikke skal sendes noe sted.
          </BodyShort>
          <BodyShort spacing>
            Hvis du likevel ønsker utskrift, kan du trykke Ctrl + P (Cmd P på
            Mac) på tastaturet når du er inne på siden du vil skrive ut.
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper>
          <Heading size="medium" level="2">
            Hvor kan jeg få vite mer om hva som kreves av meg i oppfølgingen av
            sykmeldte?
          </Heading>
          <BodyShort spacing>
            Vi har samlet informasjon til deg på siden{" "}
            <Link
              href="https://www.nav.no/no/bedrift/oppfolging/sykmeldt-arbeidstaker/relatert-informasjon/slik-folger-du-opp-sykmeldte"
              target="_blank"
              rel="noopener noreferrer"
            >
              Oppfølging underveis i sykefraværet
            </Link>
            .
          </BodyShort>
        </SporsmalOgSvarWrapper>

        <SporsmalOgSvarWrapper graaInfoPanel>
          <Heading size="small" level="3">
            Nyttig å vite:
          </Heading>
          <ul className="ml-4 list-disc">
            <li>
              <BodyShort>
                <Link
                  href="https://www.nav.no/no/bedrift/oppfolging/sykmeldt-arbeidstaker/digital-sykmelding-informasjon-til-arbeidsgivere/sporsma%CC%8Al-og-svar-om-digital-sykmelding-og-altinn_kap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Spørsmål og svar om den digitale sykmeldingen
                </Link>
              </BodyShort>
            </li>
            <li>
              <BodyShort>
                <Link
                  href="https://www.nav.no/no/bedrift/oppfolging/sykmeldt-arbeidstaker/digital-sykmelding-informasjon-til-arbeidsgivere/sporsma%CC%8Al-og-svar-om-soknaden-om-sykepenger_kap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Spørsmål og svar om søknaden om sykepenger
                </Link>
              </BodyShort>
            </li>
            <li>
              <BodyShort>
                <Link
                  href="https://www.nav.no/no/bedrift/oppfolging/sykmeldt-arbeidstaker/digital-sykmelding-informasjon-til-arbeidsgivere/filmer-og-demoer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Filmer og demoer
                </Link>
              </BodyShort>
            </li>
            <li>
              <BodyShort>
                <Link
                  href="https://www.nav.no/no/lokalt/hjelpemiddelsentraler/nav-hjelpemiddelsentral-vest-viken/lokal-informasjon/nyhetsbrev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nyhetsbrev
                </Link>
              </BodyShort>
            </li>
          </ul>
        </SporsmalOgSvarWrapper>

        <KontaktInfoPanel />

        <TilbakeLink text="Tilbake til Dine sykmeldte" href="/" marginTop />
      </PageContainer>
    </>
  );
}
