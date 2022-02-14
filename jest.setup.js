import 'next';
import '@testing-library/jest-dom/extend-expect';
import 'next-router-mock/dynamic-routes';

import { TextDecoder, TextEncoder } from 'util';

import { Modal } from '@navikt/ds-react';
import mockRouter from 'next-router-mock';

import './src/utils/test/customMatchers';

jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

Modal.setAppElement(document.createElement('div'));

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
