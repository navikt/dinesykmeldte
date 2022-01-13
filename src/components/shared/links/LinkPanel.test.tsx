import { Bandage } from '@navikt/ds-icons';
import { Tag } from '@navikt/ds-react';

import { render, screen } from '../../../utils/test/testUtils';

import LinkPanel from './LinkPanel';

describe('LinkPanel', () => {
    it('should render a simple plain link panel', () => {
        render(
            <LinkPanel Icon={Bandage} href="/test/url">
                Søknad om sykepenger
            </LinkPanel>,
        );

        expect(screen.getByRole('link', { name: /Søknad om sykepenger/ })).toBeInTheDocument();
    });

    it('should render a complex link panel', () => {
        render(
            <LinkPanel
                tag={
                    <Tag variant="warning" size="small">
                        Søknadsfrist 5. november
                    </Tag>
                }
                description="100% i 31 dager"
                notify
                detail="11. juni - 17. august"
                Icon={Bandage}
                href="/test/url"
            >
                Søknad om sykepenger
            </LinkPanel>,
        );

        const linkPanel = screen.getByRole('link', { name: /Søknad om sykepenger/ });
        expect(linkPanel).toHaveTextContent(/11. juni - 17. august/);
        expect(linkPanel).toHaveTextContent(/100% i 31 dager/);
        expect(linkPanel).toHaveTextContent(/Søknadsfrist 5. november/);
    });
});
