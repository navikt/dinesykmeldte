# Sykefraværsoppfølging – tre strukturer for fellessiden

Prototypen utforsker hvordan ledere kan få oversikt over riktig neste steg i oppfølgingen. Den ligger på `/prototype`, er avgrenset til lokal- og demomiljø og bruker bare fiktive ansatte og tilstand i minnet.

Kjør `pnpm prototype`. Lenker kan deles med `?variant=A`, `?variant=B` eller `?variant=C`, og `&ansatte=1`, `6` eller `25`.

- **A – Neste handling:** Viderefører dagens utvidbare ansattkort. Ett aktuelt steg og kompakt dokumenttilgang erstatter rekken av paneler.
- **B – Forløp:** En ansattliste og et arbeidsområde på samme fellesside. Aktuell hendelse er synlig, historikk og hjelp åpnes ved behov.
- **C – Arbeidsoversikt:** Kompakt oversikt over oppgaver på tvers av ansatte. Oppgaveknappen åpner handlingen direkte; navnet åpner B sitt arbeidsområde.

Alle variantene har virksomhetsfilter, navnesøk og tilgang til sykmeldinger, søknader, oppfølgingsplan, dialogmøter og beskjeder. Nye dokumenter er konkret merket i mockdataene og er adskilt fra oppfølgingsoppgaver. Merkingen viser nye mottatte dokumenter, og simulerer ikke produksjonens lesestatus.

«Om konseptet» samler hypotesen, hva som erstattes i dagens løsning, mulig eksperimentavgrensning og scenarioer. A og B er alternative fellessider. C er et eget valg om hvordan oversikten organiseres. Prototypen fordeler ingen reelle brukere i A/B-grupper.

## Viktige avgrensninger

- En passert dato betyr ikke gjennomført møte. Planlagt, oppgitt gjennomført, ukjent og lederens vurdering vises forskjellig.
- Registreringsdato er adskilt fra møtedato. Gjennomføring uten møtedato framstår fortsatt som oppgitt gjennomføring.
- Avtaler og møtebehovssvar tilhører riktig ansatt og oppdaterer alle visningene. Eksisterende evalueringer tas med i prioriteringen.
- Tilrettelegging og ansvar i plandialogen er eksempler. Bare oppfølgingstidspunktet kan endres i prototypen; den erstatter ikke redigering av en virkelig oppfølgingsplan.
- Datoene beregnes relativt til dagen demoen kjøres. Dette er scenarioer for konseptdiskusjon, ikke produksjonens fristberegning.
- Faglig bakgrunn: [Navs veiledning om sykefraværsoppfølging](https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte).

## Prøv dette

1. Finn Ada og åpne forberedelsen til dialogmøte 1.
2. Oppgi at møtet er gjennomført uten kjent dato. Se historikken og den nye oppgaven.
3. Avtal evaluering om fire uker. Bekreft at Ada flyttes til «Kommende» og at Emil beholder sin egen avtale.
4. Bytt mellom A, B og C uten å miste opplysningene.
5. Prøv 25 ansatte, virksomhetsfilter og søk. Åpne en oppgave direkte fra C.
6. Bruk scenarioene for gradert fravær, ukjent DM1 etter sju uker, planlagt møte og senere oppfølging.

Vurder om lederen forstår oppgaven og tidspunktet, finner forberedelse og fullfører uten hjelp. Registrering alene dokumenterer ikke bedre tilrettelegging eller effekt på sykefravær. Konseptvalg gjenstår etter prøving med ledere og teamets vurdering.
