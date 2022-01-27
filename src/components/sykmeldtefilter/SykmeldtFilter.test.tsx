import userEvent from '@testing-library/user-event';

import { render, screen } from '../../utils/test/testUtils';
import { useApplicationContext } from '../shared/StateProvider';

import SykmeldteFilter from './SykmeldteFilter';

const AssertableFilterValues = (): JSX.Element => {
    const [state] = useApplicationContext();
    return (
        <>
            <div data-testid="name-output">{state.filter.name}</div>
            <div data-testid="show-output">{state.filter.show}</div>
            <div data-testid="sortBy-output">{state.filter.sortBy}</div>
        </>
    );
};

describe('SykmeldtFilter', () => {
    it('should update context with new values', () => {
        render(
            <>
                <AssertableFilterValues />
                <SykmeldteFilter />
            </>,
        );

        const name = screen.getByRole('textbox', { name: 'Søk på navn' });
        const display = screen.getByRole('combobox', { name: 'Vis' });
        const sortBy = screen.getByRole('combobox', { name: 'Sorter etter' });

        userEvent.type(name, 'Hello Filter');
        userEvent.selectOptions(display, ['Sykmeldte']);
        userEvent.selectOptions(sortBy, ['Navn']);

        expect(name).toHaveValue('Hello Filter');
        expect(display).toHaveValue('sykmeldte');
        expect(sortBy).toHaveValue('name');
    });
});
