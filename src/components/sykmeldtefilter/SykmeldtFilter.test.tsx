import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';

import { render, screen, supressVirksomhetPickerActWarning } from '../../utils/test/testUtils';
import { createInitialQuery, createPreviewSykmeldt, createVirksomhet } from '../../utils/test/dataCreators';
import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    VirksomheterDocument,
} from '../../graphql/queries/graphql.generated';
import { RootState } from '../../state/store';

import SykmeldteFilter from './SykmeldteFilter';

const AssertableFilterValues = (): JSX.Element => {
    const filter = useSelector((state: RootState) => state.filter);
    return (
        <>
            <div data-testid="name-output">{filter.name}</div>
            <div data-testid="show-output">{filter.show}</div>
            <div data-testid="sortBy-output">{filter.sortBy}</div>
        </>
    );
};

describe('SykmeldtFilter', () => {
    function setup(sykmeldte: PreviewSykmeldtFragment[]): void {
        const initialState = [
            createInitialQuery(MineSykmeldteDocument, { mineSykmeldte: sykmeldte }),
            createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] }),
        ];

        render(
            <>
                <AssertableFilterValues />
                <SykmeldteFilter />
            </>,
            { initialState },
        );
    }

    it('should update context with new values', async () => {
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

        await supressVirksomhetPickerActWarning(screen);
    });

    it('should only render virksomhetspicker whene there are less than 5 in org', async () => {
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

        await supressVirksomhetPickerActWarning(screen);
    });
});
