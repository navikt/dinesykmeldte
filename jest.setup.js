import 'next';
import '@testing-library/jest-dom/extend-expect';
import 'next-router-mock/dynamic-routes';

import { TextDecoder, TextEncoder } from 'util';

import { Modal } from '@navikt/ds-react';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next/dist/client/router', () => require('next-router-mock'));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

window.scrollTo = jest.fn();
window.HTMLElement.prototype.scrollIntoView = () => void 0;

Modal.setAppElement(document.createElement('div'));

mockRouter.registerPaths([
    '/sykmeldt/[sykmeldtId]',
    '/sykmeldt/[sykmeldtId]/soknader',
    '/sykmeldt/[sykmeldtId]/sykmeldinger',
    '/sykmeldt/[sykmeldtId]/soknad/[soknadId]',
    '/sykmeldt/[sykmeldtId]/sykmelding/[sykmeldingId]',
]);

// Reproduce nextjs rewrites in tests
const dynamicRouteParser = mockRouter.pathParser;
mockRouter.pathParser = (url) => {
    url = dynamicRouteParser(url);

    if (url.pathname === '/') {
        url.query.sykmeldtId = 'null';
    }
    if (url.pathname === '/sykmeldt/:sykmeldtId') {
        url.pathname = '/:sykmeldtId';
    }
    return url;
};

jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {
        publicPath: '/fake/basepath',
        runtimeEnv: 'test',
    },
}));

process.env.DEBUG_PRINT_LIMIT = '30000';
