import { renderHook } from '@testing-library/react-hooks';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';

import { useUpdateBreadcrumbs } from './useBreadcrumbs';

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        publicPath: '/root',
    },
}));

describe('useUpdateBreadcrumbs', () => {
    overrideWindowLocation('/sykmeldt/test-sykmeldt/sykmeldinger');

    it('shall update when given a single crumb, automatically setting the URL', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');
        renderHook(() => useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1' }]));

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/root/sykmeldt/test-sykmeldt/sykmeldinger' },
        ]);
    });

    it('shall update when given two crumbs, automatically setting the URL for the last crumb', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');
        renderHook(() =>
            useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1', url: '/first/path' }, { title: 'Test Crumb 2' }]),
        );

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/root/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/root/sykmeldt/test-sykmeldt/sykmeldinger' },
        ]);
    });

    it('shall update when given multiple crumbs, automatically setting the URL for the last crumb', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');
        renderHook(() =>
            useUpdateBreadcrumbs(() => [
                { title: 'Test Crumb 1', url: '/first/path' },
                { title: 'Test Crumb 2', url: '/second/path' },
                { title: 'Test Crumb 3' },
            ]),
        );

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/root/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/root/second/path' },
            { handleInApp: true, title: 'Test Crumb 3', url: '/root/sykmeldt/test-sykmeldt/sykmeldinger' },
        ]);
    });
});

function overrideWindowLocation(path: string): void {
    const mockLocation = new URL(`http://localhost${path}`);
    Object.defineProperty(window, 'location', {
        get() {
            return mockLocation;
        },
    });
}
