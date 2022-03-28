import { useApolloClient, useQuery } from '@apollo/client';

import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    SykmeldingByIdDocument,
} from '../graphql/queries/graphql.generated';
import { logger } from '../utils/logger';

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
    const client = useApolloClient();
    const { sykmeldtId } = useParam(RouteLocation.Sykmeldt);

    const { data, loading, error } = useQuery(MineSykmeldteDocument, {
        onCompleted: (result) => {
            result.mineSykmeldte?.forEach((it) => {
                it.sykmeldinger.forEach((sykmelding) => {
                    client.writeQuery({
                        query: SykmeldingByIdDocument,
                        variables: { sykmeldingId: sykmelding.id },
                        data: { __typename: 'Query', sykmelding },
                    });
                });
            });
        },
    });
    const relevantSykmeldt =
        data?.mineSykmeldte?.find((it: PreviewSykmeldtFragment): boolean => it.narmestelederId === sykmeldtId) ?? null;

    if (error) {
        return { sykmeldtId, isLoading: false, sykmeldt: null, error };
    } else if (loading && !data) {
        return { sykmeldtId, isLoading: true, sykmeldt: null, error: null };
    } else if (relevantSykmeldt) {
        return { sykmeldtId, isLoading: false, sykmeldt: relevantSykmeldt, error: null };
    } else {
        logger.error(`Klarte ikke å finne sykmeldt med id ${sykmeldtId}`);
        return {
            sykmeldtId,
            isLoading: false,
            sykmeldt: null,
            error: new Error('Klarte ikke å finne sykmeldt med id ${sykmeldtId}'),
        };
    }
}
