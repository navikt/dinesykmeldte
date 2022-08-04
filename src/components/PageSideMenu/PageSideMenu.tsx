import { Pages, SideMenu } from '@navikt/dinesykmeldte-sidemeny';
import Link from 'next/link';

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { isPreviewSoknadNotification } from '../../utils/soknadUtils';

type Props = {
    sykmeldt: PreviewSykmeldtFragment | null;
    activePage: Pages;
};

function PageSideMenu({ sykmeldt, activePage }: Props): JSX.Element | null {
    if (!sykmeldt) return null;

    return (
        <SideMenu
            sykmeldtId={sykmeldt.narmestelederId}
            sykmeldtName={sykmeldt.navn}
            activePage={activePage}
            routes={{
                Sykmeldinger: {
                    notifications: sykmeldt.sykmeldinger.filter((it) => !it.lest).length,
                    internalRoute: ({ children, ...rest }) => (
                        <Link href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`} passHref>
                            <a {...rest}>{children}</a>
                        </Link>
                    ),
                },
                Soknader: {
                    notifications: sykmeldt.previewSoknader.filter((it) => isPreviewSoknadNotification(it)).length,
                    internalRoute: ({ children, ...rest }) => (
                        <Link href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`} passHref>
                            <a {...rest}>{children}</a>
                        </Link>
                    ),
                },
                Meldinger: {
                    hide: sykmeldt.aktivitetsvarsler.length === 0,
                    notifications: sykmeldt.aktivitetsvarsler.filter((it) => !it.lest).length,
                    internalRoute: ({ children, ...rest }) => (
                        <Link href={`/sykmeldt/${sykmeldt.narmestelederId}/meldinger`} passHref>
                            <a {...rest}>{children}</a>
                        </Link>
                    ),
                },
                Dialogmoter: sykmeldt.dialogmoter.length,
                Oppfolgingsplaner: sykmeldt.oppfolgingsplaner.length,
                DineSykmeldte: {
                    notifications: 0,
                    internalRoute: ({ children, ...rest }) => (
                        <Link href="/" passHref>
                            <a {...rest}>{children}</a>
                        </Link>
                    ),
                },
            }}
        />
    );
}

export default PageSideMenu;
