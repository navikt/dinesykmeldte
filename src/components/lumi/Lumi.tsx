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
      body: "Hei! Vi utforsker hvordan vi kan tilby mer konkret informasjon og veiledning til deg som leder, og til den ansatte, i sykefraværsoppfølgingen. For å kunne gjøre det, må vi lære mer om hva du trenger støtte til når du følger opp en ansatt som er sykmeldt. Vi håper du tar deg tid til å svare på noen spørsmål.",
      startLabel: "Start",
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
