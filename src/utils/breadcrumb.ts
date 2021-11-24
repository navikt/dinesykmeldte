import { setBreadcrumbs, onBreadcrumbClick } from '@navikt/nav-dekoratoren-moduler';
import { DependencyList, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { getPublicEnv } from './env';
import { logger } from './logger';

const publicConfig = getPublicEnv();

type Breadcrumb = Parameters<typeof setBreadcrumbs>[0][0];

const baseCrumb: Breadcrumb = {
    title: 'Dine sykmeldte',
    url: publicConfig.publicPath || '/',
    handleInApp: true,
};

async function updateBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    try {
        await setBreadcrumbs([baseCrumb, ...breadcrumbs]);
    } catch (e) {
        logger.error(`klarte ikke å oppdatere breadcrumbs på ${window.location.pathname}`);
    }
}

export function useUpdateBreadcrumbs(makeCrumbs: () => Breadcrumb[], deps?: DependencyList): void {
    const makeCrumbsRef = useRef(makeCrumbs);
    useEffect(() => {
        makeCrumbsRef.current = makeCrumbs;
    }, [makeCrumbs]);

    useEffect(() => {
        const crumbs = makeCrumbsRef.current().map((it) => ({ handleInApp: true, ...it }));

        (async () => {
            await updateBreadcrumbs(crumbs);
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
