import {
    createAktivitetIkkeMuligPeriode,
    createDehydratedState,
    createGradertPeriode,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSykmelding,
    createSykmeldingerByIdsPrefetchState,
} from '../../../../utils/test/dataCreators';
import { render, screen } from '../../../../utils/test/testUtils';
import { SykmeldingFragment } from '../../../../graphql/queries/react-query.generated';

import ExpandableSykmeldtPeriodSummary from './ExpandableSykmeldtPeriodSummary';

describe('ExpandableSykmeldtSummary', () => {
    function setup(
        sykmeldt = createPreviewSykmeldt(),
        sykmeldinger: (SykmeldingFragment | null)[] = [createSykmelding()],
    ): void {
        render(<ExpandableSykmeldtPeriodSummary previewSykmeldt={sykmeldt} onClick={jest.fn()} expanded={true} />, {
            state: createDehydratedState({
                queries: [
                    createSykmeldingerByIdsPrefetchState(
                        sykmeldt.previewSykmeldinger.map((it) => it.id),
                        { data: { sykmeldinger } },
                    ),
                ],
            }),
        });
    }

    it('should display summary of sykmelding with 1 period', async () => {
        const sykmeldinger = [
            createSykmelding({
                id: 'sykmelding-1',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2021-06-14', tom: '2021-07-12' })],
            }),
        ];
        setup(
            createPreviewSykmeldt({
                previewSykmeldinger: sykmeldinger.map((it) => createPreviewSykmelding({ id: it.id })),
            }),
            sykmeldinger,
        );

        expect(
            screen.getByRole('button', { name: /Ola er 100% sykmeldt i 29 dager til 12. juli 2021/ }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(2);
        expect(screen.getByRole('row', { name: '14. juni - 12. juli 2021 100% Ferdig' })).toBeInTheDocument();
    });

    it('should display summary of two sykmelding with 1 period each', async () => {
        const sykmeldinger = [
            createSykmelding({
                id: 'sykmelding-1',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2021-06-14', tom: '2021-07-12' })],
            }),
            createSykmelding({
                id: 'sykmelding-2',
                perioder: [createGradertPeriode({ grad: 50, fom: '2021-07-15', tom: '2021-07-28' })],
            }),
        ];
        setup(
            createPreviewSykmeldt({
                previewSykmeldinger: sykmeldinger.map((it) => createPreviewSykmelding({ id: it.id })),
            }),
            sykmeldinger,
        );

        expect(
            screen.getByRole('button', { name: /Ola er 50% sykmeldt i 14 dager til 28. juli 2021/ }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(3);
        expect(screen.getByRole('row', { name: '14. juni - 12. juli 2021 100% Ferdig' })).toBeInTheDocument();
        expect(screen.getByRole('row', { name: '15 - 28. juli 2021 50% Ferdig' })).toBeInTheDocument();
    });

    it('should display error when all sykmeldings fail or when periods are missing', async () => {
        const sykmeldinger = [null, null];
        setup(
            createPreviewSykmeldt({
                previewSykmeldinger: [
                    createPreviewSykmelding({ id: 'sykmelding-1' }),
                    createPreviewSykmelding({ id: 'sykmelding-2' }),
                ],
            }),
            sykmeldinger,
        );

        expect(screen.getByRole('status', { name: 'Klarte ikke å laste sykmeldingene' })).toBeInTheDocument();
        expect(screen.getByText('Klarte ikke å laste sykmeldingene')).toBeInTheDocument();
    });

    it('should display partial error when some sykmeldings fail', async () => {
        const sykmeldinger = [null, createSykmelding({ id: 'sykmelding-2' })];
        setup(
            createPreviewSykmeldt({
                previewSykmeldinger: [
                    createPreviewSykmelding({ id: 'sykmelding-1' }),
                    createPreviewSykmelding({ id: 'sykmelding-2' }),
                ],
            }),
            sykmeldinger,
        );

        expect(screen.getByRole('status', { name: 'Klarte ikke å hente 1 av 2 sykmeldinger' })).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(2);
        expect(screen.getByRole('row', { name: '8 - 15. august 2021 100% Ferdig' })).toBeInTheDocument();
    });
});
