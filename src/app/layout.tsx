import { NaisMetaTags } from "@nais/apm/react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import "@navikt/dinesykmeldte-sidemeny/dist/dinesykmeldte-sidemeny.css";
import "@navikt/lumi-survey/styles.css";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import { verifyUserLoggedIn } from "../auth/withAuthenticatedApiRoute";
import { AppProviders } from "../components/Providers/Providers";
import { browserEnv, isLocalOrDemo } from "../utils/env";
import "../style/global.css";
import { DemoBanner } from "../components/DemoBanner/DemoBanner";
import NewVersionWarning from "../components/NewVersionWarning/NewVersionWarning";
import PageLoadingState from "../components/PageLoadingState/PageLoadingState";
import LoggedOut from "../components/UserWarnings/LoggedOut/LoggedOut";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_SCENARIO_COOKIE_NAME,
  parseDemoScenarioCookieValue,
} from "../utils/demoScenario";

export const metadata: Metadata = {
  title: "Dine sykmeldte",
};

function createDecoratorEnv(): "dev" | "prod" {
  switch (browserEnv.runtimeEnv) {
    case "local":
    case "test":
    case "dev":
      return "dev";
    default:
      return "prod";
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserLoggedIn();

  // Outside local/demo we ignore this cookie entirely and always show the
  // default scenario (DemoBanner itself only renders in local/demo).
  const initialDemoScenario = isLocalOrDemo
    ? parseDemoScenarioCookieValue(
        (await cookies()).get(DEMO_SCENARIO_COOKIE_NAME)?.value,
      )
    : DEFAULT_DEMO_SCENARIO;

  const Decorator = await fetchDecoratorReact({
    env: createDecoratorEnv(),
    params: {
      breadcrumbs: [],
      language: "nb",
      context: "arbeidsgiver",
      logoutWarning: true,
      chatbot: true,
      chatbotVisible: false,
      feedback: false,
      redirectToApp: true,
    },
  });

  return (
    <html lang="nb">
      <head>
        <NaisMetaTags
          overrides={{
            app: "dinesykmeldte",
            namespace: "team-esyfo",
          }}
        />
        <Decorator.HeadAssets />
      </head>
      <body>
        <Decorator.Header />
        <AppProviders>
          <DemoBanner initialDemoScenario={initialDemoScenario} />
          <LoggedOut />
          <NewVersionWarning />
          <PageLoadingState>
            <main id="maincontent" tabIndex={-1}>
              {children}
            </main>
          </PageLoadingState>
        </AppProviders>
        <Decorator.Footer />
        <Decorator.Scripts loader={Script} />
      </body>
    </html>
  );
}
