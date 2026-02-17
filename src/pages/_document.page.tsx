import {
  type DecoratorComponentsReact,
  fetchDecoratorReact,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import Document, {
  type DocumentContext,
  type DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import type { ReactElement } from "react";
import { createInitialServerSideBreadcrumbs } from "../hooks/useBreadcrumbs";
import { browserEnv } from "../utils/env";

// The 'head'-field of the document initialProps contains data from <head> (meta-tags etc)
const getDocumentParameter = (
  initialProps: DocumentInitialProps,
  name: string,
): string => {
  return initialProps.head?.find((element) => element?.props?.name === name)
    ?.props?.content;
};

function createDecoratorEnv(ctx: DocumentContext): "dev" | "prod" {
  if (
    ctx.pathname === "/500" ||
    ctx.pathname === "/404" ||
    process.env.NODE_ENV === "development"
  ) {
    // Blir statisk kompilert i GHA så må hentes defra
    return "prod";
  }

  switch (browserEnv.runtimeEnv) {
    case "local":
    case "test":
    case "dev":
      return "dev";
    case "demo":
    case "prod":
      return "prod";
    default:
      throw new Error(`Unknown runtime environment: ${browserEnv.runtimeEnv}`);
  }
}

interface Props {
  Decorator: DecoratorComponentsReact;
  language: string;
}

class MyDocument extends Document<Props> {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps & Props> {
    const initialProps = await Document.getInitialProps(ctx);

    const Decorator = await fetchDecoratorReact({
      env: createDecoratorEnv(ctx),
      params: {
        chatbot: true,
        context: "arbeidsgiver",
        breadcrumbs: createInitialServerSideBreadcrumbs(
          ctx.pathname,
          ctx.query,
        ),
      },
    });

    const language = getDocumentParameter(initialProps, "lang");

    return { ...initialProps, Decorator, language };
  }

  render(): ReactElement {
    const { Decorator, language } = this.props;

    return (
      <Html lang={language || "no"}>
        <Head>
          <Decorator.HeadAssets />
          <link
            rel="preload"
            href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="icon"
            href="https://www.nav.no/favicon.ico"
            type="image/x-icon"
          />
        </Head>
        <body>
          <Decorator.Header />
          <Main />
          <Decorator.Footer />
          <Decorator.Scripts />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
