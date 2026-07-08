import type { Metadata } from "next";
import Script from "next/script";
import "@navikt/dinesykmeldte-sidemeny/dist/dinesykmeldte-sidemeny.css";
import "@navikt/lumi-survey/styles.css";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import { browserEnv } from "../utils/env";
import { AppProviders } from "./providers";
import "../style/global.css";
import { LabsWarning } from "../components/LabsWarning/LabsWarning";
import { useUpdateBreadcrumbs } from "../hooks/useBreadcrumbs";

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
    <html lang="no">
      <head>
        <Decorator.HeadAssets />
      </head>
      <body>
        <Decorator.Header />
        <LabsWarning />
        <AppProviders>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </AppProviders>
        <Decorator.Footer />
        <Decorator.Scripts loader={Script} />
      </body>
    </html>
  );
}
