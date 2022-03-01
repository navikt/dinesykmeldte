import { useQuery } from '@apollo/client';

import { MineSykmeldteDocument, PreviewSykmeldtFragment } from '../graphql/queries/graphql.generated';

import useParam, { RouteLocation } from './useParam';

type UseSykmeldt = { sykmeldtId: string } & (
    | { isLoading: true; sykmeldt: null; error: null }
    | { isLoading: false; sykmeldt: PreviewSykmeldtFragment; error: null }
    | { isLoading: false; sykmeldt: null; error: Error }
);

/**
 * Must be used only in pages with sykmeldtId as path parameter
 */
export function useSykmeldt(): UseSykmeldt {
    const { sykmeldtId } = useParam(RouteLocation.Sykmeldt);

    const { data, loading, error } = useQuery(MineSykmeldteDocument);
    const relevantSykmeldt =
        data?.mineSykmeldte?.find((it: PreviewSykmeldtFragment): boolean => it.narmestelederId === sykmeldtId) ?? null;

    if (error) {
        return { sykmeldtId, isLoading: false, sykmeldt: null, error };
    } else if (loading && !data) {
        return { sykmeldtId, isLoading: true, sykmeldt: null, error: null };
    } else if (relevantSykmeldt) {
        return { sykmeldtId, isLoading: false, sykmeldt: relevantSykmeldt, error: null };
    } else {
        throw new Error(`Klarte ikke å finne sykmeldt med id ${sykmeldtId} `);
    }
}
