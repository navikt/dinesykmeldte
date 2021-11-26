import 'next';
import '@testing-library/jest-dom/extend-expect';
import 'next-router-mock/dynamic-routes';

import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

mockRouter.registerPaths([
    '/sykmeldt/[sykmeldtId]/soknader',
    '/sykmeldt/[sykmeldtId]/sykmeldinger',
    '/sykmeldt/[sykmeldtId]/soknad/[soknadId]',
    '/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]',
]);

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        publicPath: '/test/root',
        runtimeEnv: 'test',
    },
}));

process.env.NEXT_PUBLIC_BASE_PATH = 'http://localhost';