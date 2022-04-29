import { formatNamePossessive } from './sykmeldtUtils';

describe('formatNamePossessive', () => {
    it('should format correct when ending with an S', () => {
        expect(formatNamePossessive('Nils', 'eplekake')).toEqual("Nils' eplekake");
    });

    it('should format correct when ending with an X', () => {
        expect(formatNamePossessive('Marx', 'bokhylle')).toEqual("Marx' bokhylle");
    });

    it('should format correct when ends is neither S or X', () => {
        expect(formatNamePossessive('Mika', 'bokhylle')).toEqual('Mikas bokhylle');
    });

    it('should provide fallback value when null', () => {
        expect(formatNamePossessive(null, 'bokhylle')).toEqual('Sykmeldtes bokhylle');
    });
});
