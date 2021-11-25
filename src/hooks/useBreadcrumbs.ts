import { ParsedUrlQuery } from 'querystring';

import { onBreadcrumbClick, setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';
import { DependencyList, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { getPublicEnv } from '../utils/env';
import { logger } from '../utils/logger';
import { formatNamePossessive } from '../utils/sykmeldtUtils';
import { PreviewSykmeldtFragment } from '../graphql/queries/react-query.generated';

const publicConfig = getPublicEnv();

type Breadcrumb = { title: string; url: string };
type LastCrumb = { title: string };
type CompleteCrumb = Parameters<typeof setBreadcrumbs>[0][0];

const baseCrumb: Breadcrumb = {
    title: 'Dine sykmeldte',
    url: publicConfig.publicPath || '/',
};

function createCompleteCrumbs(breadcrumbs: [...Breadcrumb[], LastCrumb] | [], location: string): CompleteCrumb[] {
    const prefixedCrumbs: CompleteCrumb[] = breadcrumbs.map(
        (it): CompleteCrumb => ({
            ...it,
            url:
                'url' in it
                    ? `${publicConfig.publicPath ?? '/'}${it.url}`
                    : `${publicConfig.publicPath ?? '/'}${location}`,
            handleInApp: true,
        }),
    );

    return [{ ...baseCrumb, handleInApp: true }, ...prefixedCrumbs];
}

export function useUpdateBreadcrumbs(makeCrumbs: () => [...Breadcrumb[], LastCrumb], deps?: DependencyList): void {
    const makeCrumbsRef = useRef(makeCrumbs);
    useEffect(() => {
        makeCrumbsRef.current = makeCrumbs;
    }, [makeCrumbs]);

    useEffect(() => {
        (async () => {
            try {
                const prefixedCrumbs = createCompleteCrumbs(makeCrumbsRef.current(), location.pathname);
                await setBreadcrumbs(prefixedCrumbs);
            } catch (e) {
                logger.error(`klarte ikke å oppdatere breadcrumbs på ${location.pathname}`);
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
            router.push(breadcrumb.url);
        },
        [router],
    );

    useEffect(() => {
        onBreadcrumbClick(callback);
    });
}

export function createSykmeldingerBreadcrumbs(sykmeldt: PreviewSykmeldtFragment | null): [LastCrumb] {
    return [{ title: formatNamePossessive(sykmeldt, 'sykmeldinger') }];
}

export function createSoknaderBreadcrumbs(sykmeldt: PreviewSykmeldtFragment | null): [LastCrumb] {
    return [{ title: formatNamePossessive(sykmeldt, 'søknader') }];
}

export function createSoknadBreadcrumbs(
    sykmeldtId: string,
    sykmeldt: PreviewSykmeldtFragment | null,
): [Breadcrumb, LastCrumb] {
    return [
        {
            title: formatNamePossessive(sykmeldt, 'søknader'),
            url: `/sykmeldt/${sykmeldtId}/soknader`,
        },
        { title: 'Søknad' },
    ];
}

export function createSykmeldingBreadcrumbs(
    sykmeldtId: string,
    sykmeldt: PreviewSykmeldtFragment | null,
): [Breadcrumb, LastCrumb] {
    return [
        {
            title: formatNamePossessive(sykmeldt, 'sykmeldinger'),
            url: `/sykmeldt/${sykmeldtId}/sykmeldinger`,
        },
        { title: 'Sykmelding' },
    ];
}

/**
 * These are all the paths in the application that have unique breadcrumbs.
 */
export enum SsrPathVariants {
    Root = '/',
    NotFound = '/404',
    ServerError = '/500',
    Soknader = '/sykmeldt/[sykmeldtId]/soknader',
    Soknad = '/sykmeldt/[sykmeldtId]/soknad/[soknadId]',
    Sykmeldinger = '/sykmeldt/[sykmeldtId]/sykmeldinger',
    Sykmelding = '/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]',
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
    path: string,
): CompleteCrumb[] {
    switch (pathname) {
        case SsrPathVariants.Root:
        case SsrPathVariants.NotFound:
        case SsrPathVariants.ServerError:
            return createCompleteCrumbs([], path);
        case SsrPathVariants.Soknad:
            return createCompleteCrumbs(createSoknadBreadcrumbs(query.sykmeldtId as string, null), path);
        case SsrPathVariants.Sykmelding:
            return createCompleteCrumbs(createSykmeldingBreadcrumbs(query.sykmeldtId as string, null), path);
        case SsrPathVariants.Soknader:
            return createCompleteCrumbs(createSoknaderBreadcrumbs(null), path);
        case SsrPathVariants.Sykmeldinger:
            return createCompleteCrumbs(createSykmeldingerBreadcrumbs(null), path);
        default:
            logger.error('Unknown initial path, defaulting to just base breadcrumb');
            return createCompleteCrumbs([], path);
    }
}
