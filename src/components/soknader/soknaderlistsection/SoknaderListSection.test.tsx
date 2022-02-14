import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';

import { nock, render, screen } from '../../../utils/test/testUtils';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewFremtidigSoknad,
    createPreviewKorrigertSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
} from '../../../utils/test/dataCreators';
import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    PeriodeEnum,
    PreviewSoknadFragment,
} from '../../../graphql/queries/react-query.generated';

import SoknaderListSection from './SoknaderListSection';

describe('SoknaderListSection', () => {
    function setup(soknader: PreviewSoknadFragment[]): void {
        render(<SoknaderListSection title="Test title" sykmeldtId="test-sykmeldt-id" soknader={soknader} />, {
            state: createDehydratedState({
                queries: [createMineSykmeldtePrefetchState()],
            }),
        });
    }

    it(`should display description on søknad`, async () => {
        const soknader = [
            createPreviewSendtSoknad({
                sykmeldingId: 'example-id',
                perioder: [{ fom: '2020-01-01', tom: '2020-01-08', sykmeldingstype: PeriodeEnum.AktivitetIkkeMulig }],
            }),
        ];

        setup(soknader);

        expect(await screen.findByText('100% sykmeldt i 8 dager')).toBeInTheDocument();
    });

    it('clicking a sendt søknad should go to søknad path', () => {
        mockRouter.setCurrentUrl('/initial-path');

        setup([createPreviewSendtSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]);

        userEvent.click(screen.getByRole('link', { name: /Søknad om sykepenger/ }));

        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknad/[soknadId]');
        expect(mockRouter.query.soknadId).toEqual('soknad-id');
    });

    it('clicking a korrigert søknad should go to søknad path', () => {
        mockRouter.setCurrentUrl('/initial-path');

        setup([createPreviewKorrigertSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]);

        userEvent.click(screen.getByRole('link', { name: /Søknad om sykepenger/ }));

        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknad/[soknadId]');
        expect(mockRouter.query.soknadId).toEqual('soknad-id');
    });

    it('clicking a fremtidig søknad should display a modal with feedback', () => {
        mockRouter.setCurrentUrl('/initial-path');

        setup([createPreviewFremtidigSoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]);

        userEvent.click(screen.getByRole('button', { name: /Søknad om sykepenger/ }));

        const dialog = screen.getByRole('dialog', { name: 'Søknad er ikke klar' });

        expect(mockRouter.pathname).toEqual('/initial-path');
        expect(dialog).toHaveTextContent(
            /Den ansatte får ikke fylle ut søknaden før sykefraværet er over: 21. oktober 2021/,
        );
        expect(dialog).toHaveTextContent(/Du blir varslet så fort søknaden er utfylt og sendt inn/);
    });

    it('clicking a ny søknad should display a modal with feedback, mark as read and refetch', async () => {
        const scope = nock()
            .post('/api/graphql', { query: MarkSoknadReadDocument, variables: { soknadId: 'soknad-id' } })
            .once()
            .reply(200, { data: [] })
            .post('/api/graphql', { query: MineSykmeldteDocument })
            .once()
            .reply(200, { data: [] });

        mockRouter.setCurrentUrl('/initial-path');

        setup([createPreviewNySoknad({ id: 'soknad-id', sykmeldingId: 'example-id' })]);

        userEvent.click(screen.getByRole('button', { name: /Søknad om sykepenger/ }));
        const dialog = screen.getByRole('dialog', { name: 'Den ansatte har ikke sendt inn denne søknaden ennå.' });

        expect(mockRouter.pathname).toEqual('/initial-path');
        expect(dialog).toHaveTextContent(/Du blir varslet så fort den er sendt/);
        await expect(scope).toHaveNoMoreMocks();
    });
});
