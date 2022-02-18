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

        const menu = within(screen.getByRole('navigation', { name: 'Ola Normanns dokumenter' }));
        expect(menu.getByRole('link', { name: 'Sykmeldinger' })).toHaveClass('active');
        expect(menu.getByRole('link', { name: 'Søknader om sykmeldinger' })).not.toHaveClass('active');
    });

    it('should mark søknader as active when URL is søknad page', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Ola Normanns dokumenter' }));
        expect(menu.getByRole('link', { name: 'Sykmeldinger' })).not.toHaveClass('active');
        expect(menu.getByRole('link', { name: 'Søknader om sykmeldinger' })).toHaveClass('active');
    });

    it('should navigate to correct page when clicked', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/sykmelding-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Ola Normanns dokumenter' }));
        userEvent.click(menu.getByRole('link', { name: 'Sykmeldinger' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/sykmeldinger');
        userEvent.click(menu.getByRole('link', { name: 'Søknader om sykmeldinger' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknader');
    });

    it('should show visual item for sykmelding', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/sykmelding-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Ola Normanns dokumenter' }));
        expect(menu.getByRole('listitem', { name: 'Sykmelding' })).toBeInTheDocument();
        expect(menu.queryByRole('listitem', { name: 'Soknad' })).not.toBeInTheDocument();
    });

    it('should show visual item for soknad', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknad/soknad-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        const menu = within(screen.getByRole('navigation', { name: 'Ola Normanns dokumenter' }));
        expect(menu.getByRole('listitem', { name: 'Soknad' })).toBeInTheDocument();
        expect(menu.queryByRole('listitem', { name: 'Sykmelding' })).not.toBeInTheDocument();
    });
});
