import { renderHook } from '@testing-library/react-hooks';
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler';

import { overrideWindowLocation } from '../utils/test/locationUtils';

import { createInitialServerSideBreadcrumbs, SsrPathVariants, useUpdateBreadcrumbs } from './useBreadcrumbs';

describe('useUpdateBreadcrumbs', () => {
    overrideWindowLocation('/sykmeldt/test-sykmeldt/sykmeldinger');

    it('shall update when given a single crumb, automatically setting the URL', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');
        renderHook(() => useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1' }]));

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/test/root/sykmeldt/test-sykmeldt/sykmeldinger' },
        ]);
    });

    it('shall update when given two crumbs, automatically setting the URL for the last crumb', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs');
        renderHook(() =>
            useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1', url: '/first/path' }, { title: 'Test Crumb 2' }]),
        );

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/test/root/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/test/root/sykmeldt/test-sykmeldt/sykmeldinger' },
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
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/test/root/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/test/root/second/path' },
            { handleInApp: true, title: 'Test Crumb 3', url: '/test/root/sykmeldt/test-sykmeldt/sykmeldinger' },
        ]);
    });
});

describe('createInitialServerSideBreadcrumbs', () => {
    it('should create correct crumbs for sykmeldinger page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Sykmeldinger, {}, '/current/path');

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Sykmeldtes sykmeldinger', url: '/test/root/current/path' },
        ]);
    });

    it('should create correct crumbs for søknader page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Soknader, {}, '/current/path');

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Sykmeldtes søknader', url: '/test/root/current/path' },
        ]);
    });

    it('should create correct crumbs for sykmelding page', () => {
        const result = createInitialServerSideBreadcrumbs(
            SsrPathVariants.Sykmelding,
            { sykmeldtId: 'sykmeldt-id-1' },
            '/current/path',
        );

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            {
                handleInApp: true,
                title: 'Sykmeldtes sykmeldinger',
                url: '/test/root/sykmeldt/sykmeldt-id-1/sykmeldinger',
            },
            { handleInApp: true, title: 'Sykmelding', url: '/test/root/current/path' },
        ]);
    });

    it('should create correct crumbs for søknad page', () => {
        const result = createInitialServerSideBreadcrumbs(
            SsrPathVariants.Soknad,
            { sykmeldtId: 'sykmeldt-id-1' },
            '/current/path',
        );

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' },
            { handleInApp: true, title: 'Sykmeldtes søknader', url: '/test/root/sykmeldt/sykmeldt-id-1/soknader' },
            { handleInApp: true, title: 'Søknad', url: '/test/root/current/path' },
        ]);
    });

    it('should create correct crumbs for root, 505 and 400', () => {
        const root = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {}, '/');
        const serverError = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {}, '/505');
        const notFound = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {}, '/404');

        const rootCrumb = [{ handleInApp: true, title: 'Dine sykmeldte', url: '/test/root' }];

        expect(root).toEqual(rootCrumb);
        expect(serverError).toEqual(rootCrumb);
        expect(notFound).toEqual(rootCrumb);
    });
});