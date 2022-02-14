import { render, screen } from '../../utils/test/testUtils';
import { PeriodeEnum } from '../../graphql/queries/graphql.generated';

import SoknadPerioder from './SoknadPerioder';

describe('SoknadPerioder', () => {
    it('Should show information about Soknad periode', () => {
        render(
            <SoknadPerioder
                perioder={[
                    {
                        fom: '2022-01-01',
                        tom: '2022-01-15',
                        sykmeldingstype: PeriodeEnum.Gradert,
                        sykmeldingsgrad: 80,
                    },
                ]}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Søknaden gjelder for perioden' })).toBeInTheDocument();
        expect(screen.getByText('1. - 15. januar 2022')).toBeInTheDocument();
        expect(screen.getByText('80% sykmeldt i 15 dager')).toBeInTheDocument();
    });
});
