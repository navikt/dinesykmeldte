import { useRouter } from 'next/router';

export enum RouteLocation {
    Root,
    Sykmeldt,
    Sykmelding,
    Soknad,
    Melding,
}

interface RootRoute {
    sykmeldtId: string | null;
    location: RouteLocation.Root;
}

interface SykmeldtRoute {
    sykmeldtId: string;
    location: RouteLocation.Sykmeldt;
}

interface SykmeldingRoute {
    sykmeldtId: string;
    sykmeldingId: string;
    location: RouteLocation.Sykmelding;
}

interface SoknadRoute {
    sykmeldtId: string;
    soknadId: string;
    location: RouteLocation.Soknad;
}

interface MeldingRoute {
    sykmeldtId: string;
    meldingId: string;
    location: RouteLocation.Melding;
}

function useParam(location: RouteLocation.Root): SykmeldtRoute;
function useParam(location: RouteLocation.Sykmeldt): SykmeldtRoute;
function useParam(location: RouteLocation.Sykmelding): SykmeldingRoute;
function useParam(location: RouteLocation.Soknad): SoknadRoute;
function useParam(location: RouteLocation.Melding): MeldingRoute;
function useParam(
    location: RouteLocation = RouteLocation.Sykmeldt,
): RootRoute | SykmeldtRoute | SykmeldingRoute | SoknadRoute | MeldingRoute {
    const router = useRouter();
    const sykmeldtId = router.query.sykmeldtId;

    if (typeof sykmeldtId !== 'string') {
        throw new Error(
            'Unable to find sykmeldtId in URL. Are you sure you are using this hook under the correct page?',
        );
    }

    switch (location) {
        case RouteLocation.Root:
            return {
                sykmeldtId: sykmeldtId !== 'null' ? sykmeldtId : null,
                location: RouteLocation.Root,
            };
        case RouteLocation.Sykmeldt:
            return { sykmeldtId, location: RouteLocation.Sykmeldt };
        case RouteLocation.Sykmelding:
            const sykmeldingId = router.query.sykmeldingId;
            if (typeof sykmeldingId !== 'string') {
                throw new Error(
                    'Unable to find sykmeldingId in URL. Are you sure you are using this hook under the correct page?',
                );
            }
            return { sykmeldingId, sykmeldtId, location: RouteLocation.Sykmelding };
        case RouteLocation.Soknad:
            const soknadId = router.query.soknadId;
            if (typeof soknadId !== 'string') {
                throw new Error(
                    'Unable to find soknadId in URL. Are you sure you are using this hook under the correct page?',
                );
            }
            return { soknadId, sykmeldtId, location: RouteLocation.Soknad };
        case RouteLocation.Melding:
            const meldingId = router.query.meldingId;
            if (typeof meldingId !== 'string') {
                throw new Error(
                    'Unable to find meldingId in URL. Are you sure you are using this hook under the correct page?',
                );
            }
            return { meldingId, sykmeldtId, location: RouteLocation.Melding };
    }
}

export default useParam;
