import { MockedResponse } from '@apollo/client/testing';

import { render, screen } from '../../../utils/test/testUtils';
import {
    createAktivitetIkkeMuligPeriode,
    createMock,
    createPreviewSykmelding,
    createPreviewSykmeldt,
    createSykmelding,
} from '../../../utils/test/dataCreators';
import { SykmeldingerByIdsDocument, SykmeldingFragment } from '../../../graphql/queries/graphql.generated';
import { dateAdd, dateSub, formatDate, formatDateRange } from '../../../utils/dateUtils';

import SykmeldtStatus from './SykmeldtStatus';

describe('SykmeldtStatus', () => {
    const mockSykmeldingerQuery = (sykmeldinger: SykmeldingFragment[]): MockedResponse =>
        createMock({
            request: { query: SykmeldingerByIdsDocument, variables: { ids: sykmeldinger.map((it) => it.id) } },
            result: () => ({ data: { __typename: 'Query' as const, sykmeldinger } }),
        });

    const now = new Date();
    const sykmeldingPast = createSykmelding({
        id: 'sykmelding-past',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateSub(now, { days: 30 }),
                tom: dateSub(now, { days: 20 }),
            }),
        ],
    });
    const sykmeldingFuture = createSykmelding({
        id: 'sykmelding-future',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateAdd(now, { days: 20 }),
                tom: dateAdd(now, { days: 30 }),
            }),
        ],
    });

    const sykmeldingNow = createSykmelding({
        id: 'sykmelding-now',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateSub(now, { days: 5 }),
                tom: dateAdd(now, { days: 5 }),
            }),
        ],
    });

    const sykmeldingNearFuture = createSykmelding({
        id: 'sykmelding-near',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateAdd(now, { days: 5 }),
                tom: dateAdd(now, { days: 10 }),
            }),
        ],
    });

    it('should format correctly for past period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            previewSykmeldinger: [createPreviewSykmelding({ id: sykmeldingPast.id, lest: true })],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName />, {
            mocks: [mockSykmeldingerQuery([sykmeldingPast])],
        });

        expect(
            await screen.findByText(
                `Eple var sist sykmeldt ${formatDateRange(
                    sykmeldingPast.perioder[0].fom,
                    sykmeldingPast.perioder[0].tom,
                )}`,
            ),
        ).toBeInTheDocument();
    });

    it('should format correctly for future period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            previewSykmeldinger: [createPreviewSykmelding({ id: sykmeldingFuture.id, lest: true })],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName={false} />, {
            mocks: [mockSykmeldingerQuery([sykmeldingFuture])],
        });

        expect(
            await screen.findByText(`100% sykmeldt fra ${formatDate(sykmeldingFuture.perioder[0].fom)}`),
        ).toBeInTheDocument();
    });

    it('should format correctly for current period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            previewSykmeldinger: [createPreviewSykmelding({ id: sykmeldingNow.id, lest: true })],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName />, { mocks: [mockSykmeldingerQuery([sykmeldingNow])] });

        expect(
            await screen.findByText(`Eple er 100% sykmeldt til ${formatDate(sykmeldingNow.perioder[0].tom)}`),
        ).toBeInTheDocument();
    });

    it('should format correctly for near future period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            previewSykmeldinger: [
                createPreviewSykmelding({ id: sykmeldingPast.id, lest: true }),
                createPreviewSykmelding({ id: sykmeldingNearFuture.id, lest: true }),
                createPreviewSykmelding({ id: sykmeldingFuture.id, lest: true }),
            ],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName={false} />, {
            mocks: [mockSykmeldingerQuery([sykmeldingPast, sykmeldingNearFuture, sykmeldingFuture])],
        });

        expect(
            await screen.findByText(`100% sykmeldt fra ${formatDate(sykmeldingNearFuture.perioder[0].fom)}`),
        ).toBeInTheDocument();
    });
});
