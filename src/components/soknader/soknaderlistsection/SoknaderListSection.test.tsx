import { nock, render, screen } from '../../../utils/test/testUtils';
import {
    createAktivitetIkkeMuligPeriode,
    createPreviewSendtSoknad,
    createSykmelding,
} from '../../../utils/test/dataCreators';
import { SykmeldingByIdDocument } from '../../../graphql/queries/react-query.generated';

import SoknaderListSection from './SoknaderListSection';

describe('SoknaderListSection', () => {
    it(`should lazy load description of the søknad's corresponding sykmelding`, async () => {
        nock()
            .post(
                '/api/graphql',
                JSON.stringify({
                    query: SykmeldingByIdDocument,
                    variables: { sykmeldingId: 'corresponding-sykmelding' },
                }),
            )
            .reply(200, { data: { sykmelding: createSykmelding({ perioder: [createAktivitetIkkeMuligPeriode()] }) } });

        render(
            <SoknaderListSection
                title="Test title"
                sykmeldtId="test-sykmeldt-id"
                soknader={[createPreviewSendtSoknad({ sykmeldingId: 'corresponding-sykmelding' })]}
            />,
        );

        expect(await screen.findByText('100% sykmeldt i 8 dager')).toBeInTheDocument();
    });
});
