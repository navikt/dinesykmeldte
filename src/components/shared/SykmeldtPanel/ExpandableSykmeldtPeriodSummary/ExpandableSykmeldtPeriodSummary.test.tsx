import {
    createAktivitetIkkeMuligPeriode,
    createGradertPeriode,
    createPreviewSykmeldt,
    createSykmelding,
} from '../../../../utils/test/dataCreators';
import { render, screen } from '../../../../utils/test/testUtils';

import ExpandableSykmeldtPeriodSummary from './ExpandableSykmeldtPeriodSummary';

describe('ExpandableSykmeldtSummary', () => {
    it('should display summary of sykmelding with 1 period', async () => {
        const sykmeldinger = [
            createSykmelding({
                id: 'sykmelding-1',
                perioder: [createAktivitetIkkeMuligPeriode({ fom: '2021-06-14', tom: '2021-07-12' })],
            }),
        ];

        render(
            <ExpandableSykmeldtPeriodSummary
                previewSykmeldt={createPreviewSykmeldt({
                    sykmeldinger: sykmeldinger,
                })}
                onClick={jest.fn()}
                expanded={true}
            />,
        );

        expect(screen.getByRole('button', { name: /Olas sykmeldingshistorikk/ })).toBeInTheDocument();
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

        render(
            <ExpandableSykmeldtPeriodSummary
                previewSykmeldt={createPreviewSykmeldt({
                    sykmeldinger: sykmeldinger,
                })}
                onClick={jest.fn()}
                expanded={true}
            />,
        );

        expect(screen.getByRole('button', { name: /Olas sykmeldingshistorikk/ })).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(3);
        expect(screen.getByRole('row', { name: '14. juni - 12. juli 2021 100% Ferdig' })).toBeInTheDocument();
        expect(screen.getByRole('row', { name: '15. - 28. juli 2021 50% Ferdig' })).toBeInTheDocument();
    });
});
