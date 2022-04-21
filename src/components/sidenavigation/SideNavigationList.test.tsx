import mockRouter from 'next-router-mock';

import { render, screen } from '../../utils/test/testUtils';
import {
    createPreviewSykmeldt,
    createSykmelding,
    createPreviewSendtSoknad,
    createDialogmote,
    createOppfolgingsplan,
    createBeskjeder,
} from '../../utils/test/dataCreators';

import SideNavigationList from './SideNavigationList';

describe('SideNavigationList', () => {
    describe('notifications', () => {
        it('should display Sykmeldinger link with notifications', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

            const sykmeldinger = [
                createSykmelding({
                    id: 'sykmelding-1',
                    lest: false,
                }),
                createSykmelding({
                    id: 'sykmelding-2',
                    lest: false,
                }),
            ];

            render(
                <SideNavigationList
                    sykmeldt={createPreviewSykmeldt({
                        sykmeldinger: sykmeldinger,
                    })}
                />,
            );

            expect(screen.getByRole('link', { name: '2 Sykmeldinger' })).toBeInTheDocument();
        });

        it('should display Søknader link with notifications', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmeldinger');

            const soknader = [
                createPreviewSendtSoknad({
                    id: 'soknad-1',
                    lest: false,
                }),
            ];

            render(
                <SideNavigationList
                    sykmeldt={createPreviewSykmeldt({
                        previewSoknader: soknader,
                    })}
                />,
            );

            expect(screen.getByRole('link', { name: '1 Søknader' })).toBeInTheDocument();
        });

        it('should display Dialogmøter link with notifications', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmeldinger');

            const dialogmoter = [
                createDialogmote({
                    hendelseId: 'hendelse-1',
                    tekst: 'Tekst om dialogmøte',
                }),
                createDialogmote({
                    hendelseId: 'hendelse-2',
                    tekst: 'Tekst om dialogmøte',
                }),
            ];

            render(
                <SideNavigationList
                    sykmeldt={createPreviewSykmeldt({
                        dialogmoter: dialogmoter,
                    })}
                />,
            );

            expect(screen.getByRole('link', { name: '2 Dialogmøter' })).toBeInTheDocument();
        });

        it('should display Oppfølgingsplaner link with notifications', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

            const oppfolgingsplaner = [
                createOppfolgingsplan({
                    hendelseId: 'hendelse-1',
                    tekst: 'Tekst om dialogmøte',
                }),
            ];

            render(
                <SideNavigationList
                    sykmeldt={createPreviewSykmeldt({
                        oppfolgingsplaner: oppfolgingsplaner,
                    })}
                />,
            );

            expect(screen.getByRole('link', { name: '1 Oppfølgingsplaner' })).toBeInTheDocument();
        });

        it('should display Beskjeder link with notifications', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

            const aktivitetsvarsler = [
                createBeskjeder({
                    hendelseId: 'aktivitetsvarsler-1',
                    mottatt: '2021-03-03',
                    lest: null,
                }),
            ];

            render(
                <SideNavigationList
                    sykmeldt={createPreviewSykmeldt({
                        aktivitetsvarsler: aktivitetsvarsler,
                    })}
                />,
            );

            expect(screen.getByRole('link', { name: '1 Beskjeder' })).toBeInTheDocument();
        });
    });

    describe('link title', () => {
        it('should display link title Alle sykmeldinger if sub page is active', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/test-sykmelding-id');

            render(<SideNavigationList sykmeldt={createPreviewSykmeldt()} />);

            expect(screen.getByRole('link', { name: 'Alle sykmeldinger' })).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: 'Sykmelding' })).toBeInTheDocument();
        });

        it('should display link title Alle soknader if if sub page is active', () => {
            mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id');

            render(<SideNavigationList sykmeldt={createPreviewSykmeldt()} />);

            expect(screen.getByRole('link', { name: 'Alle søknader' })).toBeInTheDocument();
            expect(screen.getByRole('listitem', { name: 'Søknad' })).toBeInTheDocument();
        });
    });
});
