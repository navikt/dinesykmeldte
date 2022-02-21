import userEvent from '@testing-library/user-event';

import { render, screen } from '../../utils/test/testUtils';
import { useApplicationContext } from '../shared/StateProvider';
import {
    createDehydratedState,
    createMineSykmeldtePrefetchState,
    createPreviewSykmeldt,
    createVirksomheterPrefetchState,
} from '../../utils/test/dataCreators';
import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';

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
    function setup(sykmeldte: PreviewSykmeldtFragment[]): void {
        const state = createDehydratedState({
            queries: [
                createMineSykmeldtePrefetchState({
                    data: {
                        mineSykmeldte: sykmeldte,
                    },
                }),
                createVirksomheterPrefetchState(),
            ],
        });

        render(
            <>
                <AssertableFilterValues />
                <SykmeldteFilter />
            </>,
            { state },
        );
    }

    it('should update context with new values', () => {
        setup([
            createPreviewSykmeldt({ fnr: '1', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '2', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '3', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '4', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '5', orgnummer: '123456789' }),
        ]);

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

    it('should only render virksomhetspicker whene there are less than 5 in org', () => {
        setup([
            createPreviewSykmeldt({ fnr: '1', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '2', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '3', orgnummer: '123456789' }),
            createPreviewSykmeldt({ fnr: '4', orgnummer: '123456789' }),
        ]);

        expect(screen.getByRole('combobox', { name: 'Velg virksomhet' })).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Søk på navn' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Vis' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', { name: 'Sorter etter' })).not.toBeInTheDocument();
    });
});
