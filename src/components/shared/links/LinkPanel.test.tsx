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
                        Ikke sendt
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
        expect(linkPanel).toHaveTextContent(/Ikke sendt/);
    });

    it('external=absolute link should have right attributes', () => {
        render(
            <LinkPanel
                tag={
                    <Tag variant="warning" size="small">
                        Ikke sendt
                    </Tag>
                }
                description="100% i 31 dager"
                notify
                detail="11. juni - 17. august"
                Icon={Bandage}
                href="https://example.com/test/url"
                external="absolute"
            >
                Søknad om sykepenger
            </LinkPanel>,
        );

        const linkPanel = screen.getByRole('link', { name: /Søknad om sykepenger/ });
        expect(linkPanel).toHaveAttribute('target', '_blank');
        expect(linkPanel).toHaveAttribute('rel', 'noopener noreferrer');
        expect(linkPanel).toHaveAttribute('href', 'https://example.com/test/url');
    });

    it('external link with external=proxy href should prepend basepath', () => {
        render(
            <LinkPanel
                tag={
                    <Tag variant="warning" size="small">
                        Ikke sendt
                    </Tag>
                }
                description="100% i 31 dager"
                notify
                detail="11. juni - 17. august"
                Icon={Bandage}
                href="/test/url"
                external="proxy"
            >
                Søknad om sykepenger
            </LinkPanel>,
        );

        const linkPanel = screen.getByRole('link', { name: /Søknad om sykepenger/ });
        expect(linkPanel).toHaveAttribute('target', '_blank');
        expect(linkPanel).toHaveAttribute('rel', 'noopener noreferrer');
        expect(linkPanel).toHaveAttribute('href', '/fake/basepath/test/url');
    });

    it('external link with external=relative href should NOT prepend basepath', () => {
        render(
            <LinkPanel
                tag={
                    <Tag variant="warning" size="small">
                        Ikke sendt
                    </Tag>
                }
                description="100% i 31 dager"
                notify
                detail="11. juni - 17. august"
                Icon={Bandage}
                href="/test/url"
                external="relative"
            >
                Søknad om sykepenger
            </LinkPanel>,
        );

        const linkPanel = screen.getByRole('link', { name: /Søknad om sykepenger/ });
        expect(linkPanel).toHaveAttribute('target', '_blank');
        expect(linkPanel).toHaveAttribute('rel', 'noopener noreferrer');
        expect(linkPanel).toHaveAttribute('href', '/test/url');
    });
});
