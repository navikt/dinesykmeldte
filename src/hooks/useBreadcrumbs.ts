import { setBreadcrumbs, onBreadcrumbClick } from '@navikt/nav-dekoratoren-moduler';
import { DependencyList, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { getPublicEnv } from '../utils/env';
import { logger } from '../utils/logger';

const publicConfig = getPublicEnv();

type Breadcrumb = { title: string; url: string };
type LastCrumb = { title: string };

const baseCrumb: Breadcrumb = {
    title: 'Dine sykmeldte',
    url: publicConfig.publicPath || '/',
};

async function updateBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    try {
        const prefixedCrumbs = publicConfig.publicPath
            ? breadcrumbs.map((it) => ({ ...it, url: `${publicConfig.publicPath}${it.url}` }))
            : breadcrumbs;

        await setBreadcrumbs([{ ...baseCrumb, handleInApp: true }, ...prefixedCrumbs]);
    } catch (e) {
        logger.error(`klarte ikke å oppdatere breadcrumbs på ${window.location.pathname}`);
    }
}

export function useUpdateBreadcrumbs(makeCrumbs: () => [...Breadcrumb[], LastCrumb], deps?: DependencyList): void {
    const makeCrumbsRef = useRef(makeCrumbs);
    useEffect(() => {
        makeCrumbsRef.current = makeCrumbs;
    }, [makeCrumbs]);

    useEffect(() => {
        const crumbs = makeCrumbsRef.current().map((it) => ({ handleInApp: true, url: location.pathname, ...it }));

        (async () => {
            try {
                await updateBreadcrumbs(crumbs);
            } catch (e) {
                console.error(e);
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
