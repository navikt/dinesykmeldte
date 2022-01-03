import mockRouter from 'next-router-mock';
import userEvent from '@testing-library/user-event';

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

        expect(screen.getByRole('link', { name: 'Sykmeldinger' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'Søknader om sykmeldinger' })).not.toHaveClass('active');
    });

    it('should mark søknader as active when URL is søknad page', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknader');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        expect(screen.getByRole('link', { name: 'Sykmeldinger' })).not.toHaveClass('active');
        expect(screen.getByRole('link', { name: 'Søknader om sykmeldinger' })).toHaveClass('active');
    });

    it('should navigate to correct page when clicked', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/sykmelding-id');

        render(
            <SideNavigation sykmeldt={createPreviewSykmeldt()}>
                <div />
            </SideNavigation>,
        );

        userEvent.click(screen.getByRole('link', { name: 'Sykmeldinger' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/sykmeldinger');
        userEvent.click(screen.getByRole('link', { name: 'Søknader om sykmeldinger' }));
        expect(mockRouter.pathname).toEqual('/sykmeldt/[sykmeldtId]/soknader');
    });
});
