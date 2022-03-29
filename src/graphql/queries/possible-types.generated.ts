export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[];
    };
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        BasePreviewSoknad: ['PreviewFremtidigSoknad', 'PreviewNySoknad', 'PreviewSendtSoknad'],
        FomTom: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd', 'Soknadsperiode'],
        Periode: ['AktivitetIkkeMulig', 'Avventende', 'Behandlingsdager', 'Gradert', 'Reisetilskudd'],
        PreviewSoknad: ['PreviewFremtidigSoknad', 'PreviewNySoknad', 'PreviewSendtSoknad'],
    },
};
export default result;
