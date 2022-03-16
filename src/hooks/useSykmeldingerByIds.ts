import { QueryResult, useApolloClient, useQuery } from '@apollo/client';

import {
    PreviewSykmeldtFragment,
    SykmeldingByIdDocument,
    SykmeldingerByIdsDocument,
    SykmeldingerByIdsQuery,
    SykmeldingerByIdsQueryVariables,
} from '../graphql/queries/graphql.generated';
import { notNull } from '../utils/tsUtils';

function useSykmeldingerByIds(
    previewSykmeldt: PreviewSykmeldtFragment,
): QueryResult<SykmeldingerByIdsQuery, SykmeldingerByIdsQueryVariables> {
    const client = useApolloClient();
    return useQuery(SykmeldingerByIdsDocument, {
        variables: {
            ids: previewSykmeldt.previewSykmeldinger.map((it) => it.id),
        },
        notifyOnNetworkStatusChange: true,
        onCompleted: (result) => {
            result.sykmeldinger.filter(notNull).forEach((it) => {
                client.writeQuery({
                    query: SykmeldingByIdDocument,
                    variables: { sykmeldingId: it.id },
                    data: { sykmelding: it },
                });
            });
        },
    });
}

export default useSykmeldingerByIds;
