import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';

import { VirksomheterDocument } from '../graphql/queries/graphql.generated';
import { logger } from '../utils/logger';
import { RootState } from '../state/store';

function useSelectedVirksomhet(): string {
    const virksomhet = useSelector((state: RootState) => state.filter.virksomhet);

    const { data: queryData } = useQuery(VirksomheterDocument);

    if (virksomhet) {
        return virksomhet;
    }

    if (!queryData) {
        logger.warn('User without prefetched virksomheter');
        return '';
    }

    if (queryData.virksomheter.length === 0) {
        return '';
    }

    return queryData.virksomheter[0].orgnummer;
}

export default useSelectedVirksomhet;
