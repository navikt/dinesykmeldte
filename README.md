# Dinesykmeldte frontendapp

[![Build Status](https://github.com/navikt/dinesykmeldte/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/navikt/dinesykmeldte/actions/workflows/build-and-deploy.yml)

[![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

**Miljøer:**

🚀 [Produksjon](https://www.nav.no/arbeidsgiver/sykmeldte)

🛠️ [Utvikling](https://www.ekstern.dev.nav.no/arbeidsgiver/sykmeldte)

🎬 [Demo](https://demo.ekstern.dev.nav.no/arbeidsgiver/sykmeldte)

## Formålet med appen

Dinesykmeldte er en arbeidsgiver-portal som hjelper nærmeste leder og ledere med oppfølging av sykmeldte medarbeidere.

```mermaid
graph TD
  Dashboard["📊 Dine sykmeldte<br/>(Dashboard)"] -->|Velg sykmeldt| EmployeeDetail["👤 Sykmeldt-detaljer"]
  Dashboard --> Alerts["🔔 Varslinger"]
  EmployeeDetail --> SickLeaves["🏥 Sykmeldinger"]
  EmployeeDetail --> Applications["📝 Søknader"]
  EmployeeDetail --> Messages["💬 Meldinger"]
  EmployeeDetail --> Dialogmoter["📅 Dialogmøter"]
  EmployeeDetail --> FollowUp["📋 Oppfølging"]
```

### Dashboard (hovedside)

Oversikt over alle sykmeldte med filtrering per virksomhet, sortering, varslinger og indikatorer for uleste elementer. Gir raskt avtrekk til detaljsider per sykmeldt.

### Sykmeldinger og søknader

Per sykmeldt vises sykmeldinger (perioder, aktivitetsbegrensninger, medisinske opplysninger) og søknader i statusene Ny, Fremtidig og Sendt. Lesestatus kan markeres på både sykmeldinger og søknader.

### Meldinger og oppfølging

Per sykmeldt finnes meldinger/hendelser og oppfølgingsaktiviteter, inkludert dialogmøter og aktivitetsvarsler. Lesestatus kan markeres på meldinger, og nærmeste-leder-informasjon er tilgjengelig som støtte i oppfølgingen.

### Infosider

Egne infosider med FAQ (spørsmål og svar) og veiledning for oppfølging av sykmeldte.

## Page routing

**basePath**[^basepath] `/arbeidsgiver/sykmeldte`

Appen har følgende hovedinngangs-punkter:

- **`/`** – Hoveddashboard med oversikt over alle sykmeldte ansatte
- **`/sykmeldt/[sykmeldtId]`** – Detaljside for spesifikk ansatt
  - **`/sykmeldt/[sykmeldtId]/sykmeldinger`** – Oversikt over sykmeldinger for ansatt
  - **`/sykmeldt/[sykmeldtId]/sykmelding/[id]`** – Detaljer for spesifikk sykmelding
  - **`/sykmeldt/[sykmeldtId]/soknader`** – Oversikt over søknader for ansatt
  - **`/sykmeldt/[sykmeldtId]/soknad/[id]`** – Detaljer for spesifikk søknad
  - **`/sykmeldt/[sykmeldtId]/meldinger`** – Meldinger/oppfølgingshistorikk for ansatt
  - **`/sykmeldt/[sykmeldtId]/melding/[id]`** – Detaljer for spesifikk melding
- **`/info`** – Informasjonssider
  - **`/info/sporsmal-og-svar`** – FAQ og spørsmål & svar
  - **`/info/oppfolging`** – Oppfølgingsveiledning

## Backend-API

Frontend-appen kommuniserer med [dinesykmeldte-backend](https://github.com/navikt/dinesykmeldte-backend) via REST API (samt intern GraphQL-integrasjon brukt internt i frontendlaget).

Brukte endepunkter:

- **GET** `/api/minesykmeldte` – Liste over sykmeldte ansatte
- **GET** `/api/virksomheter` – Liste over virksomheter
- **GET** `/api/sykmelding/{id}` – Detaljer for sykmelding
- **GET** `/api/soknad/{id}` – Detaljer for søknad
- **PUT** `/api/sykmelding/{id}/lest` – Marker sykmelding som lest
- **PUT** `/api/soknad/{id}/lest` – Marker søknad som lest
- **PUT** `/api/hendelse/{id}/lest` – Marker hendelse/aktivitetsvarsel som lest
- **PUT** `/api/hendelser/read` – Marker alle hendelser som lest
- **POST** `/api/narmesteleder/{id}/avkreft` – Koble fra ansatt (avkreft nærmeste leder)

**Autentisering:** OAuth2 token exchange (On-Behalf-Of flow) via `@navikt/oasis`

## Utvikling (kjøre lokalt)

For å komme i gang med å bygge og kjøre appen, se vår [Wiki for frontendapper](https://navikt.github.io/team-esyfo/utvikling/frontend/).

## For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen [#esyfo](https://nav-it.slack.com/archives/C012X796B4L).

---

[^basepath]: `basePath`-verdien settes i Next.js-konfigurasjonen i `next.config.ts` og angir URL-prefikset som hele appen lever under.
