"use client";

import { LumiSurveyDock, type LumiSurveyTransport } from "@navikt/lumi-survey";

import { browserEnv } from "../../utils/env";

import { survey } from "./survey";

const basePath = browserEnv.publicPath ?? "";

const transport: LumiSurveyTransport = {
  async submit(submission) {
    const response = await fetch(`${basePath}/api/lumi-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission.transportPayload),
    });

    if (!response.ok) {
      throw new Error(
        `Lumi feedback submission failed: ${response.status} ${response.statusText}`,
      );
    }
  },
};

export const Lumi = () => (
  <LumiSurveyDock
    surveyId="dinesykmeldte-arbeidsgiver-oppfolging"
    survey={survey}
    transport={transport}
    intro={{
      title: "Hjelp oss å forbedre oppfølgingen",
      body: "Hei! Vi utforsker hvordan Nav sine digitale tjenester kan tilby bedre veiledning til deg som leder, i sykefraværsløpet. Vi ønsker å lære mer om hva du trenger støtte til når du følger opp en ansatt som er sykmeldt.",
      startLabel: "Start",
    }}
    success={{
      title: "Tusen takk for hjelpen!",
      body: "Svarene dine vil bli brukt til å vurdere videre utviklingsmuligheter av de digitale tjenestene til Nav i sykefraværsoppfølgingen.",
    }}
    behavior={{
      questionLayout: "steps",
      storageStrategy: "consent",
      dismissCooldownDays: 30,
      showProgress: true,
    }}
    context={{
      tags: {
        app: "dinesykmeldte",
        rolle: "arbeidsgiver",
      },
    }}
  />
);
