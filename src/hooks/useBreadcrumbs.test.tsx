import { renderHook } from '@testing-library/react-hooks'
import * as dekoratoren from '@navikt/nav-dekoratoren-moduler'

import { overrideWindowLocation } from '../utils/test/locationUtils'

import { createInitialServerSideBreadcrumbs, SsrPathVariants, useUpdateBreadcrumbs } from './useBreadcrumbs'

describe('useUpdateBreadcrumbs', () => {
    overrideWindowLocation('/sykmeldt/test-sykmeldt/sykmeldinger')

    it('shall update when given a single crumb, automatically setting the URL', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs')
        renderHook(() => useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1' }]))

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/' },
        ])
    })

    it('shall update when given two crumbs, automatically setting the URL for the last crumb', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs')
        renderHook(() =>
            useUpdateBreadcrumbs(() => [{ title: 'Test Crumb 1', url: '/first/path' }, { title: 'Test Crumb 2' }]),
        )

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/' },
        ])
    })

    it('shall update when given multiple crumbs, automatically setting the URL for the last crumb', () => {
        const spy = jest.spyOn(dekoratoren, 'setBreadcrumbs')
        renderHook(() =>
            useUpdateBreadcrumbs(() => [
                { title: 'Test Crumb 1', url: '/first/path' },
                { title: 'Test Crumb 2', url: '/second/path' },
                { title: 'Test Crumb 3' },
            ]),
        )

        expect(spy).toHaveBeenCalledWith([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Test Crumb 1', url: '/first/path' },
            { handleInApp: true, title: 'Test Crumb 2', url: '/second/path' },
            { handleInApp: true, title: 'Test Crumb 3', url: '/' },
        ])
    })
})

describe('createInitialServerSideBreadcrumbs', () => {
    it('should create correct crumbs for sykmeldinger page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Sykmeldinger, { sykmeldtId: 'test-id' })

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Den sykmeldte', url: '/sykmeldt/test-id' },
            { handleInApp: true, title: 'Sykmeldinger', url: '/' },
        ])
    })

    it('should create correct crumbs for søknader page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Soknader, { sykmeldtId: 'test-id' })

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Den sykmeldte', url: '/sykmeldt/test-id' },
            { handleInApp: true, title: 'Søknader', url: '/' },
        ])
    })

    it('should create correct crumbs for sykmelding page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Sykmelding, { sykmeldtId: 'sykmeldt-id-1' })

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            {
                handleInApp: true,
                title: 'Sykmeldtes sykmeldinger',
                url: '/sykmeldt/sykmeldt-id-1/sykmeldinger',
            },
            { handleInApp: true, title: 'Sykmelding', url: '/' },
        ])
    })

    it('should create correct crumbs for søknad page', () => {
        const result = createInitialServerSideBreadcrumbs(SsrPathVariants.Soknad, { sykmeldtId: 'sykmeldt-id-1' })

        expect(result).toEqual([
            { handleInApp: true, title: 'Dine sykmeldte', url: '/' },
            { handleInApp: true, title: 'Sykmeldtes søknader', url: '/sykmeldt/sykmeldt-id-1/soknader' },
            { handleInApp: true, title: 'Søknad', url: '/' },
        ])
    })

    it('should create correct crumbs for root, 505 and 400', () => {
        const root = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {})
        const serverError = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {})
        const notFound = createInitialServerSideBreadcrumbs(SsrPathVariants.Root, {})

        const rootCrumb = [{ handleInApp: true, title: 'Dine sykmeldte', url: '/' }]

        expect(root).toEqual(rootCrumb)
        expect(serverError).toEqual(rootCrumb)
        expect(notFound).toEqual(rootCrumb)
    })
})
