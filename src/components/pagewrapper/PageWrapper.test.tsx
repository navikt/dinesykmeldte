import { Bandage } from '@navikt/ds-icons';
import { within } from '@testing-library/react';

import { render, screen } from '../../utils/test/testUtils';
import { createInitialQuery, createVirksomhet } from '../../utils/test/dataCreators';
import { VirksomheterDocument } from '../../graphql/queries/graphql.generated';

import PageWrapper from './PageWrapper';

describe('PageWrapper', () => {
    it('should render content', () => {
        render(
            <PageWrapper title={{ title: 'Test Title', Icon: Bandage, subtitle: 'This is a subtitle' }}>
                <div>These are children</div>
            </PageWrapper>,
        );

        const header = within(screen.getByRole('region', { name: 'Test Title' }));

        expect(header.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
        expect(header.getByText('This is a subtitle')).toBeInTheDocument();
        expect(header.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should render picker when hasPicker is true', () => {
        render(
            <PageWrapper title={{ title: 'Test Title', Icon: Bandage }} hasPicker>
                <div>These are children</div>
            </PageWrapper>,
            {
                initialState: [createInitialQuery(VirksomheterDocument, { virksomheter: [createVirksomhet()] })],
            },
        );

        const header = within(screen.getByRole('region', { name: 'Test Title' }));

        expect(header.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
        expect(header.getByRole('combobox', { name: 'Velg virksomhet' })).toBeInTheDocument();
    });
});
