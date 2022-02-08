import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';

import { nock, render, screen } from '../../../utils/test/testUtils';
import {
    createAktivitetIkkeMuligPeriode,
    createPreviewFremtidigSoknad,
    createPreviewKorrigertSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
    createSykmelding,
} from '../../../utils/test/dataCreators';
import { SykmeldingByIdDocument } from '../../../graphql/queries/react-query.generated';

import SoknaderListSection from './SoknaderListSection';

describe('SoknaderListSection', () => {
    function nockCorrespondingSykmelding(): void {
        nock()
            .post(
                '/api/graphql',
                JSON.stringify({
                    query: SykmeldingByIdDocument,
                    variables: { sykmeldingId: 'example-id' },
                }),
            )
            .reply(200, { data: { sykmelding: createSykmelding({ perioder: [createAktivitetIkkeMuligPeriode()] }) } });
    }

    it(`should lazy load description of the søknad's corresponding sykmelding`, async () => {
        nockCorrespondingSykmelding();

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewSendtSoknad({ sykmeldingId: 'example-id' })]}
            />,
        );

        expect(await screen.findByText('100% sykmeldt i 8 dager')).toBeInTheDocument();
    });

    it('clicking a sendt søknad should go to søknad path', () => {
        mockRouter.setCurrentUrl('/initial-path');

        nockCorrespondingSykmelding();

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewSendtSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]}
            />,
        );

        userEvent.click(screen.getByRole('link', { name: /Søknad om sykepenger/ }));

        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknad/[soknadId]');
        expect(mockRouter.query.soknadId).toEqual('soknad-id');
    });

    it('clicking a korrigert søknad should go to søknad path', () => {
        mockRouter.setCurrentUrl('/initial-path');

        nockCorrespondingSykmelding();

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewKorrigertSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]}
            />,
        );

        userEvent.click(screen.getByRole('link', { name: /Søknad om sykepenger/ }));

        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknad/[soknadId]');
        expect(mockRouter.query.soknadId).toEqual('soknad-id');
    });

    it('clicking a fremtidig søknad should display a modal with feedback', () => {
        mockRouter.setCurrentUrl('/initial-path');

        nockCorrespondingSykmelding();

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewFremtidigSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]}
            />,
        );

        userEvent.click(screen.getByRole('button', { name: /Søknad om sykepenger/ }));

        const dialog = screen.getByRole('dialog', { name: 'Søknad er ikke klar' });

        expect(mockRouter.pathname).toEqual('/initial-path');
        expect(dialog).toHaveTextContent(
            /Den ansatte får ikke fylle ut søknaden før sykefraværet er over: 21. oktober 2021/,
        );
        expect(dialog).toHaveTextContent(/Du blir varslet så fort søknaden er utfylt og sendt inn/);
    });

    it('clicking a fremtidig søknad should display a modal with feedback', () => {
        mockRouter.setCurrentUrl('/initial-path');

        nockCorrespondingSykmelding();

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewNySoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]}
            />,
        );

        userEvent.click(screen.getByRole('button', { name: /Søknad om sykepenger/ }));
        const dialog = screen.getByRole('dialog', { name: 'Den ansatte har ikke sendt inn denne søknaden ennå.' });

        expect(mockRouter.pathname).toEqual('/initial-path');
        expect(dialog).toHaveTextContent(/Du blir varslet så fort den er sendt/);
    });
});
