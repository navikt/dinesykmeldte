import { createMockedSsrContext, HappyPathSsrResult } from '../../../utils/test/testUtils';

import { getServerSideProps } from './soknader.page';

describe('Sykmeldinger page', () => {
    describe('getServerSideProps', () => {
        it('should pre-fetch "mine sykmeldte"-query', async () => {
            const result = (await getServerSideProps(createMockedSsrContext())) as unknown as HappyPathSsrResult;

            expect(result.props.dehydratedState.queries[0].queryKey).toEqual(['MineSykmeldte']);
        });
    });
});
