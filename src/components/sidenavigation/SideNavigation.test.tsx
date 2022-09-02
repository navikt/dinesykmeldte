import mockRouter from 'next-router-mock';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';

import { render, screen } from '../../utils/test/testUtils';
import { createPreviewSykmeldt } from '../../utils/test/dataCreators';

import SideNavigation from './SideNavigation';

describe('SideNavigation', () => {
    it('should mark sykmeldinger as active when URL is sykmeldinger page', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmeldinger');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Olas oversikt' }));
        expect(menu.getByRole('link', { name: 'Sykmeldinger' })).toHaveClass('activeMenuItem');
        expect(menu.getByRole('link', { name: 'Søknader' })).not.toHaveClass('activeMenuItem');
    });

    it('should mark søknader as active when URL is søknad page', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Olas oversikt' }));
        expect(menu.getByRole('link', { name: '1 Sykmeldinger' })).not.toHaveClass('activeMenuItem');
        expect(menu.getByRole('link', { name: 'Søknader' })).toHaveClass('activeMenuItem');
    });

    it('should navigate to correct page when clicked', async () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/sykmelding-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Olas oversikt' }));
        await userEvent.click(menu.getByRole('link', { name: 'Alle sykmeldinger' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/sykmeldinger');
        await userEvent.click(menu.getByRole('link', { name: 'Søknader' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknader');
    });

    it('should show visual item for sykmelding', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/sykmelding-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Olas oversikt' }));
        expect(menu.getByRole('listitem', { name: 'Sykmelding' })).toBeInTheDocument();
        expect(menu.queryByRole('listitem', { name: 'Søknad' })).not.toBeInTheDocument();
    });

    it('should show visual item for soknad', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknad/soknad-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Olas oversikt' }));
        expect(menu.getByRole('listitem', { name: 'Søknad' })).toBeInTheDocument();
        expect(menu.queryByRole('listitem', { name: 'Sykmelding' })).not.toBeInTheDocument();
    });
});
