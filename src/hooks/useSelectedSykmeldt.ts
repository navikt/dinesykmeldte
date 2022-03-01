import { useQuery } from '@apollo/client';

import { useApplicationContext } from '../components/shared/StateProvider';
import { VirksomheterDocument } from '../graphql/queries/graphql.generated';
import { logger } from '../utils/logger';

function useSelectedVirksomhet(): string {
    const [state] = useApplicationContext();

    const { data: queryData } = useQuery(VirksomheterDocument);

    if (state.virksomhet) {
        return state.virksomhet;
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
