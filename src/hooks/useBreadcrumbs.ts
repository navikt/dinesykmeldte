import type { ParsedUrlQuery } from "node:querystring";
import {
  onBreadcrumbClick,
  setBreadcrumbs,
} from "@navikt/nav-dekoratoren-moduler";
import { logger } from "@navikt/next-logger";
import { useRouter } from "next/router";
import { type DependencyList, useCallback, useEffect, useRef } from "react";
import { logAmplitudeEvent } from "../amplitude/amplitude";
import type { PreviewSykmeldtFragment } from "../graphql/queries/graphql.generated";
import { browserEnv } from "../utils/env";
import {
  formatNamePossessive,
  formatNameSubjective,
} from "../utils/sykmeldtUtils";

type Breadcrumb = { title: string; url: string; analyticsTitle?: string };
type LastCrumb = { title: string };
type CompleteCrumb = Parameters<typeof setBreadcrumbs>[0][0];

const baseCrumb: CompleteCrumb = {
  title: "Dine sykmeldte",
  url: browserEnv.publicPath || "/",
  handleInApp: true,
};

/**
 * The last crumb does not need to provide a URL, since it's only used to display the text for the "active" crumb.
 */
function createCompleteCrumbs(
  breadcrumbs: [...Breadcrumb[], LastCrumb] | [],
): CompleteCrumb[] {
  const prefixedCrumbs: CompleteCrumb[] = breadcrumbs.map(
    (it): CompleteCrumb => ({
      ...it,
      url: "url" in it ? `${browserEnv.publicPath ?? ""}${it.url}` : "/",
      handleInApp: true,
    }),
  );

  return [baseCrumb, ...prefixedCrumbs];
}

export function useUpdateBreadcrumbs(
  makeCrumbs: () => [...Breadcrumb[], LastCrumb] | [],
  deps?: DependencyList,
): void {
  const makeCrumbsRef = useRef(makeCrumbs);
  useEffect(() => {
    makeCrumbsRef.current = makeCrumbs;
  }, [makeCrumbs]);

  useEffect(() => {
    (async () => {
      try {
        const prefixedCrumbs = createCompleteCrumbs(makeCrumbsRef.current());
        await setBreadcrumbs(prefixedCrumbs);
      } catch (e) {
        logger.error(
          `klarte ikke å oppdatere breadcrumbs på ${location.pathname}`,
        );
        logger.error(e);
      }
    })();
    // Custom hook that passes deps array to useEffect, linting will be done where useUpdateBreadcrumbs is used
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook into the decorator's breadcrumbs, and use Next's router
 * instead to avoid full page loads on breadcrumb clicks
 */
export function useHandleDecoratorClicks(): void {
  const router = useRouter();
  const callback = useCallback(
    (breadcrumb: Breadcrumb) => {
      logAmplitudeEvent(
        {
          eventName: "navigere",
          data: {
            lenketekst: breadcrumb.analyticsTitle ?? breadcrumb.title,
            destinasjon: breadcrumb.url,
          },
        },
        { breadcrumbs: true },
      );

      // router.push automatically pre-pends the base route of the application
      router.push(
        breadcrumb.url.replace(browserEnv.publicPath || "", "") || "/",
      );
    },
    [router],
  );

  useEffect(() => {
    onBreadcrumbClick(callback);
  });
}

export function createSykmeldingerBreadcrumbs(
  sykmeldtId: string,
  name: string | undefined,
): [Breadcrumb, LastCrumb] {
  return [
    {
      title: formatNameSubjective(name),
      url: `/sykmeldt/${sykmeldtId}`,
      analyticsTitle: "Den sykmeldte",
    },
    { title: "Sykmeldinger" },
  ];
}

export function createSoknaderBreadcrumbs(
  sykmeldtId: string,
  name: string | undefined,
): [Breadcrumb, LastCrumb] {
  return [
    {
      title: formatNameSubjective(name),
      url: `/sykmeldt/${sykmeldtId}`,
      analyticsTitle: "Den sykmeldte",
    },
    { title: "Søknader" },
  ];
}

export function createMeldingBreadcrumbs(
  sykmeldtId: string,
  name: string | undefined,
): [...Breadcrumb[], LastCrumb] {
  return [
    {
      title: formatNameSubjective(name),
      url: `/sykmeldt/${sykmeldtId}`,
      analyticsTitle: "Den sykmeldte",
    },
    { title: "Aktivitetsvarsler", url: `/sykmeldt/${sykmeldtId}/meldinger` },
    { title: "Påminnelse om aktivitet" },
  ];
}

export function createMeldingerBreadcrumbs(
  sykmeldtId: string,
  name: string | undefined,
): [Breadcrumb, LastCrumb] {
  return [
    {
      title: formatNameSubjective(name),
      url: `/sykmeldt/${sykmeldtId}`,
      analyticsTitle: "Den sykmeldte",
    },
    { title: "Aktivitetsvarsler" },
  ];
}

export function createSoknadBreadcrumbs(
  sykmeldtId: string,
  sykmeldt: PreviewSykmeldtFragment | null,
): [Breadcrumb, LastCrumb] {
  return [
    {
      title: formatNamePossessive(sykmeldt?.navn, "søknader"),
      url: `/sykmeldt/${sykmeldtId}/soknader`,
      analyticsTitle: "Den sykmeldtes søknader",
    },
    { title: "Søknad" },
  ];
}

export function createSykmeldingBreadcrumbs(
  sykmeldtId: string,
  sykmeldt: PreviewSykmeldtFragment | null,
): [Breadcrumb, LastCrumb] {
  return [
    {
      title: formatNamePossessive(sykmeldt?.navn, "sykmeldinger"),
      url: `/sykmeldt/${sykmeldtId}/sykmeldinger`,
      analyticsTitle: "Den sykmeldtes sykmeldinger",
    },
    { title: "Sykmelding" },
  ];
}

export function createSporsmalOgSvarBreadcrumbs(): [LastCrumb] {
  return [{ title: "Spørsmål og svar" }];
}

export function createOppfolgingBreadcrumbs(): [LastCrumb] {
  return [{ title: "Oppfølging underveis i sykefraværet" }];
}

/**
 * These are all the paths in the application that have unique breadcrumbs.
 */
export enum SsrPathVariants {
  Root = "/",
  NotFound = "/404",
  ServerError = "/500",
  Error = "/_error",
  Sykmeldt = "/[sykmeldtId]",
  Soknader = "/sykmeldt/[sykmeldtId]/soknader",
  Soknad = "/sykmeldt/[sykmeldtId]/soknad/[soknadId]",
  Sykmeldinger = "/sykmeldt/[sykmeldtId]/sykmeldinger",
  Sykmelding = "/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]",
  Meldinger = "/sykmeldt/[sykmeldtId]/meldinger",
  Melding = "/sykmeldt/[sykmeldtId]/melding/[meldingId]",
  SporsmalOgSvar = "/info/sporsmal-og-svar",
  Oppfolging = "/info/oppfolging",
}

/**
 * Creates various breadcrumbs depending on which route is Server Side Rendered. These are in essence
 * just a SSR-version of the fully detailed breadcrumb-logic that happens in each page component.
 *
 * The reason for duplicating this logic is to avoid as much unecessary repainting when the app is hydrated
 * after a the initial SSR paint. But some of the breadcrumbs rely on the data that is fetched, so these
 * initial SSR breadcrumbs are without any user names.
 *
 * Any changes here should also be reflected in the page's breadcrumb logic.
 */
export function createInitialServerSideBreadcrumbs(
  pathname: SsrPathVariants | string,
  query: ParsedUrlQuery,
): CompleteCrumb[] {
  switch (pathname) {
    case SsrPathVariants.Root:
    case SsrPathVariants.Error:
    case SsrPathVariants.NotFound:
    case SsrPathVariants.ServerError:
    case SsrPathVariants.Sykmeldt:
      return createCompleteCrumbs([]);
    case SsrPathVariants.Soknad:
      return createCompleteCrumbs(
        createSoknadBreadcrumbs(query.sykmeldtId as string, null),
      );
    case SsrPathVariants.Sykmelding:
      return createCompleteCrumbs(
        createSykmeldingBreadcrumbs(query.sykmeldtId as string, null),
      );
    case SsrPathVariants.Soknader:
      return createCompleteCrumbs(
        createSoknaderBreadcrumbs(query.sykmeldtId as string, undefined),
      );
    case SsrPathVariants.Sykmeldinger:
      return createCompleteCrumbs(
        createSykmeldingerBreadcrumbs(query.sykmeldtId as string, undefined),
      );
    case SsrPathVariants.SporsmalOgSvar:
      return createCompleteCrumbs(createSporsmalOgSvarBreadcrumbs());
    case SsrPathVariants.Oppfolging:
      return createCompleteCrumbs(createOppfolgingBreadcrumbs());
    case SsrPathVariants.Melding:
      return createCompleteCrumbs(
        createMeldingBreadcrumbs(query.sykmeldtId as string, undefined),
      );
    case SsrPathVariants.Meldinger:
      return createCompleteCrumbs(
        createMeldingerBreadcrumbs(query.sykmeldtId as string, undefined),
      );
    default:
      logger.error(
        `Unknown initial path (${pathname}), defaulting to just base breadcrumb`,
      );
      return createCompleteCrumbs([]);
  }
}
