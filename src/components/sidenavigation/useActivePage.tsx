import { useRouter } from 'next/router';

export type Pages = 'sykmeldinger' | 'soknader' | 'sykmelding' | 'soknad';

export function useActivePage(): Pages {
    const router = useRouter();

    if (router.pathname.endsWith('sykmeldinger')) {
        return 'sykmeldinger';
    } else if (router.pathname.endsWith('soknader')) {
        return 'soknader';
    } else if ('sykmeldingId' in router.query) {
        return 'sykmelding';
    } else if ('soknadId' in router.query) {
        return 'soknad';
    } else {
        throw new Error(`Illegal state: You cannot use side navigation on this path: ${router.pathname}`);
    }
}
