import { useRouter } from 'next/router';

import { PreviewSykmeldtFragment, useMineSykmeldteQuery } from '../graphql/queries/react-query.generated';

type UseSykmeldt = { sykmeldtId: string } & (
    | { isLoading: true; sykmeldt: null; error: null }
    | { isLoading: false; sykmeldt: PreviewSykmeldtFragment; error: null }
    | { isLoading: false; sykmeldt: null; error: Error }
);

/**
 * Must be used only in pages with sykmeldtId as path parameter
 */
export function useSykmeldt(): UseSykmeldt {
    const {
        query: { sykmeldtId },
    } = useRouter();

    if (!sykmeldtId || typeof sykmeldtId !== 'string') {
        throw new Error('Illegal state: Can not display list without sykmeldtId path parameter');
    }

    const { data, isLoading, error } = useMineSykmeldteQuery();
    const relevantSykmeldt =
        data?.mineSykmeldte?.find((it: PreviewSykmeldtFragment): boolean => it.narmestelederId === sykmeldtId) ?? null;

    if (error) {
        return { sykmeldtId, isLoading: false, sykmeldt: null, error };
    } else if (isLoading) {
        return { sykmeldtId, isLoading: true, sykmeldt: null, error: null };
    } else if (relevantSykmeldt) {
        return { sykmeldtId, isLoading: false, sykmeldt: relevantSykmeldt, error: null };
    } else {
        throw new Error(`Klarte ikke å finne sykmeldt med id ${sykmeldtId} `);
    }
}
