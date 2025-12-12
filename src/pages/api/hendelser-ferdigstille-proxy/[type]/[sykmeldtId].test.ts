import { vi, beforeEach, describe, it, expect } from 'vitest'
import { NextApiRequest, NextApiResponse } from 'next'

import mockDb, { resetMockDb } from '../../../../graphql/resolvers/mockresolvers/mockDb'

import proxy from './[sykmeldtId].api'

describe('ferdigstilling av hendelse proxy', () => {
    beforeEach(() => {
        resetMockDb()
    })

    /**
     * Next.js > 15.4 rewrite workaround test.
     * In Next.js > 15.4, links to oppfølgingsplaner and dialogmøter stopped working
     * because rewrites don't populate req.query with the dynamic segments.
     * This test ensures the URL parsing fallback works correctly.
     *
     * If this test fails because req.query IS populated, the workaround in
     * parseParamsFromUrl may no longer be needed and should be investigated further.
     *
     * Added: 2025-12-12
     */
    describe('Next.js rewrite workaround', () => {
        it('should parse type and sykmeldtId from URL when req.query is empty (rewrite scenario)', async () => {
            const req: Partial<NextApiRequest> = {
                url: '/dialogmoter/sykmeldt-1-id?hendelser=f311aee3-9b50-4214-a456-732fb2dcacc0',
                query: {
                    hendelser: ['f311aee3-9b50-4214-a456-732fb2dcacc0'],
                    // Note: type and sykmeldtId are intentionally missing to simulate Next.js 16 rewrite behavior
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasDialogmote('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/sykmeldt-1-id',
            )
        })

        it('should parse oppfolgingsplan from URL when req.query is empty (rewrite scenario)', async () => {
            const req: Partial<NextApiRequest> = {
                url: '/oppfolgingsplaner/sykmeldt-1-id?hendelser=4014c115-b584-43a8-9467-aa609b8b7262',
                query: {
                    hendelser: ['4014c115-b584-43a8-9467-aa609b8b7262'],
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasOppfolgingsplan('4014c115-b584-43a8-9467-aa609b8b7262')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/sykmeldt-1-id',
            )
        })
    })

    describe('given a dialogmote', () => {
        it('should delete provided hendelseId from database and redirect to sykmeldtId', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'dialogmote',
                    hendelser: ['f311aee3-9b50-4214-a456-732fb2dcacc0'],
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasDialogmote('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/sykmeldt-1-id',
            )
        })

        it('should delete provided hendelseId from database and redirect to sykmeldtId when query param is string', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'dialogmote',
                    hendelser: 'f311aee3-9b50-4214-a456-732fb2dcacc0',
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasDialogmote('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/sykmeldt-1-id',
            )
        })

        it('should support deleting multiple hendelser if provided', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'dialogmote',
                    hendelser: [
                        'f311aee3-9b50-4214-a456-732fb2dcacc0',
                        '5146da6c-66fe-4683-b9d6-2a57262e2c2f',
                        // This ID should remain
                        // 10d0026c-8e8c-47c0-b08a-3ba745469787
                    ],
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasDialogmote('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false)
            expect(mockDb().hasDialogmote('5146da6c-66fe-4683-b9d6-2a57262e2c2f')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/sykmeldt-1-id',
            )

            expect(mockDb().hasDialogmote('10d0026c-8e8c-47c0-b08a-3ba745469787')).toBe(true)
        })

        it('should support a plain redirect without any hendelser', async () => {
            resetMockDb()
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'dialogmote',
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/sykmeldt-1-id',
            )
        })
    })

    describe('given a oppfolgingsplan', () => {
        it('should delete provided hendelseId from database and redirect to sykmeldtId', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'oppfolgingsplan',
                    hendelser: ['4014c115-b584-43a8-9467-aa609b8b7262'],
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasOppfolgingsplan('4014c115-b584-43a8-9467-aa609b8b7262')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/sykmeldt-1-id',
            )
        })

        it('should delete provided hendelseId from database and redirect to sykmeldtId when query param is string', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'oppfolgingsplan',
                    hendelser: '4014c115-b584-43a8-9467-aa609b8b7262',
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasOppfolgingsplan('4014c115-b584-43a8-9467-aa609b8b7262')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/sykmeldt-1-id',
            )
        })

        it('should support deleting multiple hendelser if provided', async () => {
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'oppfolgingsplan',
                    hendelser: [
                        '4014c115-b584-43a8-9467-aa609b8b7262',
                        '0189afe5-7636-48d9-be95-b0da01a61c6f',
                        // This ID should remain
                        // 2322ae93-92c2-43a5-b537-92a968e59026
                    ],
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(mockDb().hasOppfolgingsplan('4014c115-b584-43a8-9467-aa609b8b7262')).toBe(false)
            expect(mockDb().hasOppfolgingsplan('0189afe5-7636-48d9-be95-b0da01a61c6f')).toBe(false)
            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/sykmeldt-1-id',
            )

            expect(mockDb().hasOppfolgingsplan('2322ae93-92c2-43a5-b537-92a968e59026')).toBe(true)
        })

        it('should support a plain redirect without any hendelser', async () => {
            resetMockDb()
            const req: Partial<NextApiRequest> = {
                query: {
                    sykmeldtId: 'sykmeldt-1-id',
                    type: 'oppfolgingsplan',
                },
            }
            const res: Partial<NextApiResponse> = {
                redirect: vi.fn() as unknown as NextApiResponse['redirect'],
            }

            await proxy(req as NextApiRequest, res as NextApiResponse)

            expect(res.redirect).toHaveBeenCalledWith(
                'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/sykmeldt-1-id',
            )
        })
    })
})
