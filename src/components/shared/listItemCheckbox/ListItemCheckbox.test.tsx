import { render, screen } from '../../../utils/test/testUtils';

import { ListItemCheckbox } from './ListItemCheckbox';

describe('ListItemCheckbox', () => {
    it('should show checkbox with Ja if value is true', () => {
        render(
            <ListItemCheckbox title="Hadde du ferie i tidsrommet 1. november 2021 - 8. november 2021?" value={true} />,
        );

        expect(screen.getByText('Ja')).toBeInTheDocument();
        expect(screen.queryByText('Nei')).not.toBeInTheDocument();
    });

    it('should show checkbox with Nei if value is false', () => {
        render(
            <ListItemCheckbox title="Hadde du ferie i tidsrommet 1. november 2021 - 8. november 2021?" value={false} />,
        );

        expect(screen.queryByText('Ja')).not.toBeInTheDocument();
        expect(screen.getByText('Nei')).toBeInTheDocument();
    });
});
