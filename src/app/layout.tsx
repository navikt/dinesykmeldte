import type { Metadata } from "next";
import Script from "next/script";
import "@navikt/dinesykmeldte-sidemeny/dist/dinesykmeldte-sidemeny.css";
import "@navikt/lumi-survey/styles.css";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import { verifyUserLoggedIn } from "../auth/withAuthenticatedAppRoute";
import { AppProviders } from "../components/Providers/Providers";
import { browserEnv } from "../utils/env";
import "../style/global.css";
import { configureLogger } from "@navikt/next-logger";
import { LabsWarning } from "../components/LabsWarning/LabsWarning";
import NewVersionWarning from "../components/NewVersionWarning/NewVersionWarning";
import PageLoadingState from "../components/PageLoadingState/PageLoadingState";
import LoggedOut from "../components/UserWarnings/LoggedOut/LoggedOut";

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
  configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  });

  await verifyUserLoggedIn();

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
        <Decorator.HeadAssets />
      </head>
      <body>
        <Decorator.Header />
        <AppProviders>
          <LabsWarning />
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
