import { NextApiRequest, NextApiResponse } from 'next';

import mockDb, { resetMockDb } from '../../../graphql/resolvers/mockresolvers/mockDb';

import proxy from './[sykmeldtId].api';

describe('ferdigstilling av dialogmøter proxy', () => {
    beforeEach(() => {
        resetMockDb();
    });

    it('should delete provided hendelsesId from database and redirect to sykmeldtId', async () => {
        const req: Partial<NextApiRequest> = {
            query: {
                sykmeldtId: 'sykmeldt-1-id',
                hendelser: ['f311aee3-9b50-4214-a456-732fb2dcacc0'],
            },
        };
        const res: Partial<NextApiResponse> = {
            redirect: jest.fn(),
        };

        await proxy(req as NextApiRequest, res as NextApiResponse);

        expect(mockDb().hasHendelse('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false);
        expect(res.redirect).toHaveBeenCalledWith(
            'https://dialogmotearbeidsgiver.labs.nais.io/syk/dialogmotearbeidsgiver/sykmeldt-1-id',
        );
    });

    it('should support deleting multiple hendelser if provided', async () => {
        const req: Partial<NextApiRequest> = {
            query: {
                sykmeldtId: 'sykmeldt-1-id',
                hendelser: [
                    'f311aee3-9b50-4214-a456-732fb2dcacc0',
                    '5146da6c-66fe-4683-b9d6-2a57262e2c2f',
                    // This ID should remain
                    // 10d0026c-8e8c-47c0-b08a-3ba745469787
                ],
            },
        };
        const res: Partial<NextApiResponse> = {
            redirect: jest.fn(),
        };

        await proxy(req as NextApiRequest, res as NextApiResponse);

        expect(mockDb().hasHendelse('f311aee3-9b50-4214-a456-732fb2dcacc0')).toBe(false);
        expect(mockDb().hasHendelse('5146da6c-66fe-4683-b9d6-2a57262e2c2f')).toBe(false);
        expect(res.redirect).toHaveBeenCalledWith(
            'https://dialogmotearbeidsgiver.labs.nais.io/syk/dialogmotearbeidsgiver/sykmeldt-1-id',
        );

        expect(mockDb().hasHendelse('10d0026c-8e8c-47c0-b08a-3ba745469787')).toBe(true);
    });

    it('should support a plain redirect without any hendelser', async () => {
        resetMockDb();
        const req: Partial<NextApiRequest> = {
            query: {
                sykmeldtId: 'sykmeldt-1-id',
            },
        };
        const res: Partial<NextApiResponse> = {
            redirect: jest.fn(),
        };

        await proxy(req as NextApiRequest, res as NextApiResponse);

        expect(res.redirect).toHaveBeenCalledWith(
            'https://dialogmotearbeidsgiver.labs.nais.io/syk/dialogmotearbeidsgiver/sykmeldt-1-id',
        );
    });
});
