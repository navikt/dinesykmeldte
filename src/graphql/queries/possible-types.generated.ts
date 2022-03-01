export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[];
    };
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        BasePreviewSoknad: [
            'PreviewFremtidigSoknad',
            'PreviewKorrigertSoknad',
            'PreviewNySoknad',
            'PreviewSendtSoknad',
        ],
        FomTom: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd', 'Soknadsperiode'],
        Periode: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        PreviewSoknad: ['PreviewFremtidigSoknad', 'PreviewKorrigertSoknad', 'PreviewNySoknad', 'PreviewSendtSoknad'],
    },
};
export default result;
