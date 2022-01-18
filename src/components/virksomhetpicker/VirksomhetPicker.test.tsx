import { waitForElementToBeRemoved } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { screen, render, nock } from '../../utils/test/testUtils';
import { useVirksomheterQuery } from '../../graphql/queries/react-query.generated';
import {
    createDehydratedState,
    createVirksomhet,
    createVirksomheterPrefetchState,
} from '../../utils/test/dataCreators';
import { useApplicationContext } from '../shared/StateProvider';

import VirksomhetPicker from './VirksomhetPicker';

describe('VirksomhetPicker', () => {
    it('should support user not having any virksomheter', async () => {
        render(<VirksomhetPicker />, {
            state: createDehydratedState({
                queries: [
                    createVirksomheterPrefetchState({
                        data: { virksomheter: [] },
                    }),
                ],
            }),
        });

        expect(await screen.findByRole('option', { name: 'Ingen virksomheter tilgjengelig' })).toBeInTheDocument();
    });

    it('should support lazy loading virksomheter', async () => {
        nock()
            .post('/api/graphql', { query: useVirksomheterQuery.document })
            .reply(200, {
                data: {
                    virksomheter: [
                        createVirksomhet({ navn: 'Virk 1', orgnummer: 'virk-1' }),
                        createVirksomhet({ navn: 'Virk 2', orgnummer: 'virk-2' }),
                    ],
                },
            });

        render(<VirksomhetPicker />);

        await waitForElementToBeRemoved(screen.queryByRole('option', { name: 'Laster virksomheter...' }));

        const combobox = within(screen.getByRole('combobox', { name: 'Velg virksomhet' }));
        const optionsInCombobox = combobox.getAllByRole('option');

        expect(optionsInCombobox[0]).toHaveValue('virk-1');
        expect(optionsInCombobox[0]).toHaveTextContent('Virk 1');
        expect(optionsInCombobox[1]).toHaveValue('virk-2');
        expect(optionsInCombobox[1]).toHaveTextContent('Virk 2');
    });

    it('should update state when selecting', async () => {
        const AssertableVirksomhet = (): JSX.Element => {
            const [state] = useApplicationContext();
            return <div data-testid="virksomhet-output">{state.virksomhet}</div>;
        };

        render(
            <>
                <VirksomhetPicker />
                <AssertableVirksomhet />
            </>,
            {
                state: createDehydratedState({
                    queries: [
                        createVirksomheterPrefetchState({
                            data: {
                                virksomheter: [
                                    createVirksomhet({ navn: 'Virk 1', orgnummer: 'virk-1' }),
                                    createVirksomhet({ navn: 'Pick me', orgnummer: 'pick-me' }),
                                ],
                            },
                        }),
                    ],
                }),
            },
        );

        userEvent.selectOptions(screen.getByRole('combobox', { name: 'Velg virksomhet' }), ['Pick me']);

        expect(screen.getByTestId('virksomhet-output')).toHaveTextContent('pick-me');
    });
});
