import userEvent from '@testing-library/user-event';

import { render, screen, within } from '../../utils/test/testUtils';
import { createPreviewSykmeldt } from '../../utils/test/dataCreators';
import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { range } from '../../utils/tsUtils';

import PaginatedSykmeldteList from './PaginatedSykmeldteList';

describe('PaginatedSykmeldteList', () => {
    function setup(sykmeldte: PreviewSykmeldtFragment[]): void {
        render(<PaginatedSykmeldteList sykmeldte={sykmeldte} focusSykmeldtId={null} />);
    }

    it('should not paginate when exactly 5 sykmeldte', () => {
        setup([
            createPreviewSykmeldt({ narmestelederId: '1' }),
            createPreviewSykmeldt({ narmestelederId: '2' }),
            createPreviewSykmeldt({ narmestelederId: '3' }),
            createPreviewSykmeldt({ narmestelederId: '4' }),
            createPreviewSykmeldt({ narmestelederId: '5' }),
        ]);

        expect(screen.queryByRole('region', { name: 'navigering for paginering' })).not.toBeInTheDocument();
    });

    it('should show pagination when more than 5 sykmeldte', () => {
        setup([
            createPreviewSykmeldt({ narmestelederId: '1' }),
            createPreviewSykmeldt({ narmestelederId: '2' }),
            createPreviewSykmeldt({ narmestelederId: '3' }),
            createPreviewSykmeldt({ narmestelederId: '4' }),
            createPreviewSykmeldt({ narmestelederId: '5' }),
            createPreviewSykmeldt({ narmestelederId: '6' }),
        ]);

        const region = screen.getByRole('region', { name: 'navigering for paginering' });

        expect(region).toBeInTheDocument();
        expect(within(region).getByRole('button', { name: 'Forrige' })).toBeInTheDocument();
        expect(within(region).getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(within(region).getByRole('button', { name: '2' })).toBeInTheDocument();
        expect(within(region).getByRole('button', { name: 'Neste' })).toBeInTheDocument();
    });

    describe('when filtering for page', () => {
        const sixSykmeldte = [
            createPreviewSykmeldt({ navn: 'Normann 1', narmestelederId: '1' }),
            createPreviewSykmeldt({ navn: 'Normann 2', narmestelederId: '2' }),
            createPreviewSykmeldt({ navn: 'Normann 3', narmestelederId: '3' }),
            createPreviewSykmeldt({ navn: 'Normann 4', narmestelederId: '4' }),
            createPreviewSykmeldt({ navn: 'Normann 5', narmestelederId: '5' }),
            createPreviewSykmeldt({ navn: 'Normann 6', narmestelederId: '6' }),
        ];

        const getSykmeldteNamesOnPage = (page: HTMLElement): (string | null)[] =>
            within(page)
                .getAllByRole('button')
                .map((it) => within(it).getByRole('heading'))
                .map((it) => it.textContent);

        it('should show correct sykmeldte on correct page 1', () => {
            setup(sixSykmeldte);

            const region = screen.getByRole('region', { name: 'navigering for paginering' });

            expect(within(region).getByRole('button', { name: '1' })).toHaveAttribute('aria-selected', 'true');
            expect(within(region).getByRole('button', { name: '2' })).toHaveAttribute('aria-selected', 'false');

            const page = screen.getByRole('region', { name: 'side 1 av sykmeldte' });
            expect(getSykmeldteNamesOnPage(page)).toEqual([
                'Normann 1',
                'Normann 2',
                'Normann 3',
                'Normann 4',
                'Normann 5',
            ]);
        });

        it('should show correct sykmeldte on correct page 2', () => {
            setup(sixSykmeldte);

            const region = screen.getByRole('region', { name: 'navigering for paginering' });
            userEvent.click(within(region).getByRole('button', { name: 'Neste' }));

            expect(within(region).getByRole('button', { name: '1' })).toHaveAttribute('aria-selected', 'false');
            expect(within(region).getByRole('button', { name: '2' })).toHaveAttribute('aria-selected', 'true');

            const page = screen.getByRole('region', { name: 'side 2 av sykmeldte' });
            expect(getSykmeldteNamesOnPage(page)).toEqual(['Normann 6']);
        });

        it('should handle navigating with next/prev and number buttons', () => {
            setup(sixSykmeldte);

            const assertFirstPage = (): void => {
                expect(within(region).getByRole('button', { name: 'Forrige' })).toBeDisabled();
                expect(within(region).getByRole('button', { name: 'Neste' })).not.toBeDisabled();
                expect(within(region).getByRole('button', { name: '1' })).toHaveAttribute('aria-selected', 'true');
                expect(within(region).getByRole('button', { name: '2' })).toHaveAttribute('aria-selected', 'false');
            };

            const assertSecondPage = (): void => {
                expect(within(region).getByRole('button', { name: 'Forrige' })).not.toBeDisabled();
                expect(within(region).getByRole('button', { name: 'Neste' })).toBeDisabled();
                expect(within(region).getByRole('button', { name: '1' })).toHaveAttribute('aria-selected', 'false');
                expect(within(region).getByRole('button', { name: '2' })).toHaveAttribute('aria-selected', 'true');
            };

            const region = screen.getByRole('region', { name: 'navigering for paginering' });

            assertFirstPage();
            userEvent.click(within(region).getByRole('button', { name: 'Neste' }));
            assertSecondPage();
            userEvent.click(within(region).getByRole('button', { name: 'Forrige' }));
            assertFirstPage();
            userEvent.click(within(region).getByRole('button', { name: '2' }));
            assertSecondPage();
            userEvent.click(within(region).getByRole('button', { name: '1' }));
            assertFirstPage();
        });
    });

    it.each([
        [14, 3],
        [15, 3],
        [16, 4],
        [25, 5],
        [99, 20],
        [1001, 201],
    ])('should create %i pages when %i sykmeldte', (sykmeldteCount, expectedPages) => {
        const sykmeldte: PreviewSykmeldtFragment[] = range(sykmeldteCount).map((key) =>
            createPreviewSykmeldt({ narmestelederId: `${key}` }),
        );

        setup(sykmeldte);

        const region = screen.getByRole('region', { name: 'navigering for paginering' });
        const buttons = within(region)
            .getAllByRole('button')
            .slice(1, -1)
            .map((it) => it.textContent);

        expect(buttons).toEqual(range(expectedPages).map((key) => `${key + 1}`));
    });
});
