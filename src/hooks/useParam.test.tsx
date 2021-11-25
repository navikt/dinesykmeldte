import mockRouter from 'next-router-mock';
import { renderHook } from '@testing-library/react-hooks';

import useParam, { RouteLocation } from './useParam';

describe('useParam', () => {
    it('should get params for paths with sykmeldt param', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmeldinger');

        const { result } = renderHook(() => useParam(RouteLocation.Sykmeldt));

        expect(result.current.sykmeldtId).toEqual('test-sykmeldt-id');
    });

    it('should get params for paths with sykmelding param', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/sykmelding/test-sykmelding-id');

        const { result } = renderHook(() => useParam(RouteLocation.Sykmelding));

        expect(result.current.sykmeldtId).toEqual('test-sykmeldt-id');
        expect(result.current.sykmeldingId).toEqual('test-sykmelding-id');
    });

    it('should get params for paths with soknad param', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id');

        const { result } = renderHook(() => useParam(RouteLocation.Soknad));

        expect(result.current.sykmeldtId).toEqual('test-sykmeldt-id');
        expect(result.current.soknadId).toEqual('test-soknad-id');
    });

    it('should throw param if wrong location is passed for the URL', () => {
        mockRouter.setCurrentUrl('/sykmeldt/test-sykmeldt-id/soknad/test-soknad-id');

        const { result } = renderHook(() => useParam(RouteLocation.Sykmelding));

        expect(result.error?.message).toEqual(
            'Unable to find sykmeldingId in URL. Are you sure you are using this hook under the correct page?',
        );
    });
});
