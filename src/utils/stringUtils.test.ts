import { getBirthday, cleanId } from './stringUtils';

describe('cleanId', () => {
    it('should clean normal text', () => {
        expect(cleanId('Hello yes this is normal text. Some punctuation?')).toEqual(
            'Hello_yes_this_is_normal_text__Some_punctuation_',
        );
    });
});

describe('getBirthday', () => {
    it('should get the 6 first characters', () => {
        const fnr = '12778018869';
        expect(getBirthday(fnr)).toBe('127780');
    });
});
