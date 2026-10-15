"use client";

import { LumiSurveyDock, type LumiSurveyTransport } from "@navikt/lumi-survey";
import type { ReactElement } from "react";
import { browserEnv } from "../../utils/env";
import { paaminnelseSurvey } from "./paaminnelseSurvey";

const basePath = browserEnv.publicPath ?? "";

const transport: LumiSurveyTransport = {
  async submit({ transportPayload }) {
    const response = await fetch(`${basePath}/api/lumi-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transportPayload),
    });

    if (!response.ok) {
      throw new Error(`Innsending feilet med status ${response.status}`);
    }
  },
};

export function PaaminnelseLumi(): ReactElement {
  return (
    <LumiSurveyDock
      surveyId="dinesykmeldte-paaminnelse-oppfolgingsplan"
      survey={paaminnelseSurvey}
      transport={transport}
      context={{
        tags: {
          app: "dinesykmeldte",
          rolle: "arbeidsgiver",
          flate: "sykmelding-paaminnelse",
        },
      }}
    />
  );
}
