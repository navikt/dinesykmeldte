# Migrering til Aksel v8 (dinesykmeldte)

Dato: 2026-02-10

## Mål

- Oppgradere til Aksel v8 (`@navikt/ds-react`, `@navikt/ds-css`, `@navikt/aksel-icons`, `@navikt/ds-tailwind`).
- Fjerne deprecated API-er og komponenter.
- Erstatte gammel token-bruk (`--a-*`) med nye tokens (`--ax-*`) der det er relevant.
- Fjerne komponent-tokens (`--ac-*`) (fjernet i v8) og bruke supported API-er (props/data-color/Box/tokens).
- Redusere custom styling: foretrekke Aksel-komponenter + primitives (`Box`, `HStack/VStack`, `Page`, spacing tokens) fremfor CSS-moduler/Tailwind når det ikke trengs.

## Referanse: mønstre fra andre apper i workspace

**meroppfolging-frontend**
- Bruker v8-pakker og `@navikt/ds-tailwind` preset.
- Skrur av Tailwind preflight for å unngå konflikt med Aksel layered CSS.
- Importrekkefølge i global CSS: tailwind base → `@navikt/ds-css` → tailwind components/utilities.
- Wrapper appen i `Theme theme="light"` (App Router).

**syfo-oppfolgingsplan-frontend**
- Viser hvordan Aksel CSS kan importeres i CSS layer (spesielt relevant ved Tailwind v4).
- Bruker v8 Tailwind-klasser som `bg-ax-*` og responsive prefix `ax-md:`.

**aktivitetskrav-frontend**
- Nyttig som referanse for komponentbruk og testoppsett.

## Status i dinesykmeldte (nå)

- `@navikt/ds-react`, `@navikt/ds-css`, `@navikt/aksel-icons`, `@navikt/ds-tailwind` ligger på v8 (per nå `^8.3.0`).
- Tailwind v4 (`tailwindcss ^4.1.18`) med `@tailwindcss/postcss`.
- Global styling i `src/style/global.css` bruker Tailwind v4-import og legger `@navikt/ds-css` i `layer(components)` slik at utilities kan overstyre.
- Codemods er kjørt og manuell opprydding av legacy tokens/klasser er gjort.

## Migreringsguide (Aksel v8)

Primær doc: https://aksel.nav.no/grunnleggende/migreringsguider/versjon-8

Viktigste punkter for oss:

- Tokens følger med `@navikt/ds-css` i v8.
- Kjør codemod for tokens: `npx @navikt/aksel@latest codemod v8-tokens`.
- Aksel CSS bruker nå `@layer` og har spesifisitet 0.
- Alle komponent-tokens (`--ac-*`) er fjernet og må håndteres manuelt.
- Tailwind-klasser fra Aksel er nå prefikset med `ax` og refererer til css-variabler.

## Sjekkliste (implementasjon/verifisering)

### 0) Forarbeid

- Kjør en ren install etter oppgradering (`npm ci` eller `npm install`).
- Kjør verifikasjon etter hver større del:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm test`

### 1) Oppgradere dependencies til v8

Status: gjort.

Oppdater i `package.json`:

- `@navikt/ds-react` → `^8.x`
- `@navikt/ds-css` → `^8.x`
- `@navikt/aksel-icons` → `^8.x`
- `@navikt/ds-tailwind` (devDependency) → `^8.x`

Vurder også:
- `@navikt/dinesykmeldte-sidemeny`: sjekk om det finnes v8-kompatibel versjon.

### 2) Tailwind-konfig for v8

Status: gjort.

Oppdater `tailwind.config.js` til v8-preset (`@navikt/ds-tailwind` v8), og skru av preflight slik `meroppfolging-frontend` gjør:

- `corePlugins: { preflight: false }`

Dette reduserer risiko for at Tailwind reset overstyrer Aksel CSS.

For Tailwind v4:

- `postcss.config.js` bruker `@tailwindcss/postcss`.
- `src/style/global.css` bruker:
  - `@import "tailwindcss";`
  - `@import "@navikt/ds-css" layer(components);`
  - `@config "../../tailwind.config.js";`

### 3) Kjør Aksel codemods

Status: gjort.

Kjør disse (rekkefølge anbefalt):

1. `npx @navikt/aksel@latest codemod v8-tokens`
2. `npx @navikt/aksel@latest codemod v8-list`
3. `npx @navikt/aksel@latest codemod v8-prop-deprecate`
4. `npx @navikt/aksel@latest codemod v8-box`
5. `npx @navikt/aksel@latest codemod v8-box-new`

Valgfritt (men fint å ta nå når vi først migrerer):
- `npx @navikt/aksel@latest codemod v8-*-variant` (tag/chips/button/link/accordion/toggle-group) for å migrere til `data-color` der det er relevant.

### 4) Manuelle fixes (må gjøres)

Status: gjort.

#### 4.1 Komponent-tokens (`--ac-*`) som må bort

Treff i kodebasen:

- `src/components/shared/veileder/Veileder.module.css`
  - Bruker `--ac-guide-panel-border: none;` (må fjernes/erstattes)
- `src/components/shared/SykmeldtPanel/ExpandableSykmeldtPanel.tsx`
  - Setter `--ac-expansioncard-bg` dynamisk (må erstattes)

Tiltak:

- Finn supported API for å fjerne border på `GuidePanel` (foretrekk props/komponent-API).
- Erstatt `--ac-expansioncard-bg` med:
  - `data-color` / variant-API hvis støttet av `ExpansionCard`, eller
  - wrapper via `Box asChild background="..."`/Aksel tokens, eller
  - Tailwind `bg-ax-*` hvis vi allerede er på ds-tailwind v8 og trenger enkel conditional styling.

#### 4.2 Gamle tokens (`--a-*`) i CSS-moduler

Codemod `v8-tokens` bør oppdatere det meste, men disse filene er en sjekkliste å verifisere manuelt:

- `src/components/UxSignals/UxSignalsWidget.module.css`
- `src/components/MarkdownPage/components/ExpandableInfo.module.css`
- `src/components/PageLoadingState/PageLoadingState.module.css`
- `src/components/shared/veileder/Veileder.module.css`

#### 4.3 Tailwind-klasser som må oppdateres til v8

Eksempel som må ryddes (sannsynligvis legacy ds-tailwind v7):

- `src/components/shared/IconHeading/IconHeading.tsx`
  - `className="--a-surface-warning-moderate ..."` må byttes til v8 `ax`-prefiksede klasser og/eller Aksel-komponent/tokens.

### 5) Verifisering

- Bygg og kjør lokalt (`npm run dev`) og gå gjennom hovedflyten.
- Lint + typecheck + tester.
- Sjekk spesielt:
  - Layout/spacing etter token-migrering
  - At dekoratøren/side-meny ikke mister styling
  - At vi ikke har gjenværende `--ac-*` og minimalt med `--a-*`

Merk:
- Testene logger en Aksel-advarsel om `Accordion` med kun ett item. Dette ser ut til å komme fra sidemeny/dekoratør og stopper ikke testkjøring, men kan ryddes opp senere (evt. `ExpansionPanel` hvis vi eier komponenten).

## Åpne beslutninger

1) Tailwind v4 er nå tatt i bruk i dinesykmeldte. Om det dukker opp styling-regresjoner i prod, er første sjekk at importrekkefølge og `layer(components)` i `src/style/global.css` er riktig.

2) `--veileder-background` i `src/style/global.css` er en hardkodet farge. Skal den mappes til en Aksel token (for å minimere custom styling), eller er den en bevisst produktfarge?
