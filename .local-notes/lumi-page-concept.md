# Lumi: Side-konsept (pages)

## Bakgrunn

Designerne skisserte surveyen i 3 bolker med flere spørsmål per bolk. Lumi støtter i dag kun `steps` (1 spørsmål per steg) eller `singlePage` (alt på én side). Et side-konsept ville tillatt gruppering av spørsmål i sider med egne overskrifter.

## Ønsket API

```typescript
interface LumiSurveyPage {
  id: string;
  heading?: string;
  description?: string;
  questionIds: string[]; // referanser til spørsmål-ID-er i questions-arrayet
}

interface LumiSurveyConfig {
  type: "custom" | "rating" | ...;
  questions: LumiSurveyQuestion[];  // flat array (uendret)
  pages?: LumiSurveyPage[];         // valgfritt — grupperer spørsmål i sider
}
```

**Behavior:**
- Hvis `pages` er definert → navigasjon er side-basert (Neste/Tilbake mellom sider)
- Alle spørsmål på gjeldende side vises samtidig
- Progress basert på antall sider (konsistent)
- Innsending flater til vanlig flat struktur (ingen backend-endringer)
- Hvis `pages` IKKE er definert → eksisterende oppførsel (steps/singlePage)

## Eksempel for dinesykmeldte-surveyen

```typescript
const survey: LumiSurveyConfig = {
  type: "custom",
  questions: [...],  // alle 9 spørsmål som i dag
  pages: [
    {
      id: "demografi",
      heading: "Om virksomheten din",
      questionIds: ["antall-ansatte", "bransje"],
    },
    {
      id: "barrierer",
      heading: "Barrierer og muligheter",
      questionIds: ["storste-hindring", "vanskeligst", "vanskeligst-annet", "lettere", "viktigst"],
    },
    {
      id: "erfaring",
      heading: "Rolle og erfaring",
      questionIds: ["hvor-ofte", "erfaring"],
    },
  ],
};
```

## Berørte filer i Lumi

| Fil | Endring | Kompleksitet |
|-----|---------|-------------|
| `packages/lumi-survey/src/core/types.ts` | Ny `LumiSurveyPage`-type, utvide `LumiSurveyConfig` | Lav |
| `packages/lumi-survey/src/components/LumiSurveyDock/hooks/useStepNavigation.ts` | Refaktorere fra question-basert til page-basert navigasjon | **Høy** |
| `packages/lumi-survey/src/components/LumiSurveyDock/DockPanel.tsx` | Rendre multiple spørsmål per steg, vise side-heading | Middels |
| `packages/lumi-survey/src/core/evaluateBranching.ts` | Branching per side (ikke per spørsmål) | Middels |
| `packages/lumi-survey/src/core/evaluateVisibility.ts` | visibleIf innen en side — dynamisk vis/skjul mens brukeren fyller ut | Middels |

## Tekniske utfordringer

### 1. useStepNavigation er hardkodet til 1 spørsmål = 1 steg
- `currentStep` er en index inn i `questions`-arrayet
- `isLastStep = currentStep >= questions.length - 1`
- Må refaktoreres til: `currentPageIndex` inn i `pages`-arrayet
- `isLastStep = currentPageIndex >= pages.length - 1`

### 2. Branching-logikk
- `evaluateBranching()` kjører per spørsmål og returnerer `nextIndex`
- Med sider: branch-evaluering må skje etter siste spørsmål på siden
- Branching kan hoppe til en spesifikk side (ikke spørsmål)
- Trenger mapping fra `questionId` → `pageId`

### 3. visibleIf innen en side
- Q4b (betinget fritekst) er på samme side som Q4 (multiChoice)
- Når brukeren velger "Annet" i Q4, skal Q4b dukke opp dynamisk
- Dette fungerer allerede i singlePage-modus, men må verifiseres i page-modus

### 4. Validering per side
- "Neste"-knappen må validere alle required spørsmål på gjeldende side
- Betingede spørsmål som er skjult (visibleIf = false) skal ikke valideres
- Gjeldende per-steg-validering sjekker kun 1 spørsmål

## Estimat

~150-200 linjer Lumi-endringer, 2-4 dager inkl. testing.

## Prioritet

Vurdert og utsatt 2026-03-05. Grunnen: Surveyen kan shippes med `steps`-modus (1 spørsmål per steg) + intro-prop + ProgressBar. Side-konseptet er "nice to have" og bør gjøres som eget Lumi-prosjekt.
