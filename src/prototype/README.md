# Sykefraværsoppfølging – tre strukturer for fellessiden

Prototypen undersøker en hendelsesorientert fellesside for nærmeste leder. Dialogmøte 1 innføres som én relevant hendelse, sammen med eksisterende dokumenter, møtebehov, innkallinger, oppfølgingsplan og sykepengedager. Det som faktisk er aktuelt for den ansatte fremheves; hendelsestypen alene bestemmer ikke prioriteten. Den finnes på `/prototype` bare i lokal- og demomiljø, med fiktive ansatte og tilstand i minnet. Konseptvalg gjenstår.

Kjør `pnpm prototype`. Del `?variant=A`, `?variant=B` eller `?variant=C`, eventuelt med `&ansatte=1`, `6` eller `25`.

- **A – Neste handling:** Neste steg i de utvidbare ansattkortene, sammen med andre aktuelle hendelser og dokumenttilgang.
- **B – Forløp:** Ansattliste og forløp på samme fellesside. Aktuelt neste steg fremheves, andre aktuelle hendelser og fremtidige stoppunkter vises kompakt. Tidligere hendelser kan åpnes.
- **C – Arbeidsoversikt:** Neste steg på tvers av ansatte. Handlingen åpner relevant støtte; navnet og øvrige hendelser åpner forløpet.

Alle variantene har virksomhetsfilter, navnesøk og dokumenttilgang. De seks ansatte viser både tidlig og senere oppfølging: helt og delvis fravær, skjult påminnelse, svart møtebehov, konkret innkalling og maksdato. Det større utvalget har også en ubesvart forespørsel om møtebehov. Situasjonene utforskes ved å velge ansatte direkte; ingen separat situasjonsvelger. «Om konseptet» forklarer hypotesene og avgrensningen for teamet.

## Avgrensning

- Ingen registrering av møtedato, gjennomføring, unntak eller vurdering av pliktoppfyllelse. En passert dato eller en skjult påminnelse sier ikke om møtet har funnet sted.
- «Skjul påminnelsen» endrer bare en reversibel visningstilstand i minnet. Ingen årsak innhentes. Valget gjelder per ansatt, beholdes på tvers av variantene og nullstilles ved ny lasting.
- Oppfølgingsplanen håndterer tiltak, avtaler og evaluering i sin egen tjeneste. Denne prototypen lager ingen ekstra kalender eller evalueringsdato. Lenken til [eksisterende plandemo](https://demo.ekstern.dev.nav.no/syk/oppfolgingsplan/123) er merket som en separat demo med en annen fiktiv ansatt.
- Invitasjonen kopieres og fylles ut i lederens vanlige kanal. Ingen innkalling sendes her.
- Samme visuelle hierarki brukes for alle hendelser: aktuelt neste steg, andre samtidige hendelser, kommende stoppunkter og tidligere hendelser. DM1 får tydelig støtte når relevant, og fortrenger ikke resten av oppfølgingen.
- Forventet tidspunkt for dialogmøte 2 er ikke en innkalling. Passerte datoer, inkludert DM1-fristen, merkes aldri som gjennomført uten en kjent hendelse.
- Nye dokumenter og beskjeder holder den ansatte synlig i «Aktuelt nå», selv når en DM1-påminnelse er skjult.
- Grensesnittet viser ønsket produksjonsdesign, men data og prioritering er fortsatt en prototype. Faktisk møtedato og avtalt oppfølging må komme fra riktig fagkilde; mottaksdato for en hendelsesmelding er ikke møtedato. Eksisterende varseltyper, inkludert manglende søknad, må bevares ved produksjonalisering.
- Datoene følger dagen demoen kjøres. Fristberegningen er til konseptdiskusjon, ikke produksjonens beregning ved skiftende grader eller avbrudd i fraværet.

## Faglig grunnlag og avklaring før produksjon

Arbeidsmiljøloven § 4-6 fjerde ledd skiller mellom helt fravær, der møte skal holdes innen sju uker med mindre det er åpenbart unødvendig, og delvis fravær, der møte skal holdes når arbeidsgiver, arbeidstaker eller sykmelder anser det hensiktsmessig. Sykmelder skal innkalles hvis arbeidstakeren alene eller sammen med arbeidsgiveren ønsker det. Nav er normalt ikke deltaker, men kan innkalles ved partenes ønske. Arbeidsgiver skal dokumentere oppfølgingen i virksomheten.

- [Arbeidsmiljøloven §§ 2-3 og 4-6](https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/)
- [Navs veiledning til arbeidsgiver](https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte)
- [Helsedirektoratets veiledning om dialogmøter med arbeidsgiver](https://www.helsedirektoratet.no/veiledere/sykmelderveileder/sykmelders-rolle-i-sykmeldingsperioden-oppfolgingsplan-aktivitetskravet-og-dialogmoter/dialogmoter-med-arbeidsgiver)

Den tidligere rutinemessige rapporteringen til Nav ble avviklet i 2014. Dette betyr ikke at Nav aldri kan innhente opplysninger. Det avklarer heller ikke hjemmelen for en ny, generell innsamling av møtestatus. Før personknyttet lagring eller analyse må formål, nødvendighet, behandlingsgrunnlag og dataminimering avklares konkret, også for en varig skjulepreferanse og eventuelle analyselogger. En annen knappetekst løser ikke dette.

- [Forarbeidene om opphevelse av rapporteringsplikten](https://www.regjeringen.no/no/dokumenter/Prop-102-L-20132014/id760646/?ch=4)

## Prøv dette

1. Velg Ada. Finn arbeidsgivers ansvar, fristen, innkallingsforslaget og hvem som kan delta.
2. Velg Emil. Kontroller at gradert fravær beskrives som møte ved behov hos en av de tre partene.
3. Skjul Adas påminnelse. Overskriften er fortsatt «Dialogmøte 1» og angir aldri gjennomføring. Vis påminnelsen igjen.
4. Velg Noor, som starter med skjult påminnelse. Åpne veiledningen eller vis påminnelsen igjen.
5. Bytt mellom A, B og C. Kontroller at valget gjelder riktig ansatt.
6. Velg Jonas og Liv. Kontroller at senere oppfølging og kommende hendelser løftes fram, mens DM1 ligger tidligere i forløpet med ukjent status.
7. Skjul Kais DM1-påminnelse og filtrer på «Aktuelt nå». Ny sykmelding og beskjed skal fortsatt holde ham synlig.
8. Prøv 25 ansatte, filtrering og navnesøk. Åpne oppfølgingsplanen og se at oppfølgingstidspunktet håndteres i den eksisterende tjenesten. Se også Emils samtidige planoppfølging og DM1-veiledning.

Mål først om lederen forstår ansvaret og finner riktig støtte. Bruk av veiledning og skjuling er ikke mål på gjennomførte møter. Måling av gjennomføring og utbytte krever et separat opplegg og en tydelig definert populasjon av relevante forløp.
