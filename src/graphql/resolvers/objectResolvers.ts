import { PeriodeEnum, Resolvers, SoknadSporsmal, SoknadsstatusEnum, SporsmalTagEnum } from './resolvers.generated';

const objectResolvers: Partial<Resolvers> = {
    Periode: {
        __resolveType: (parent) => {
            switch (parent.type) {
                case PeriodeEnum.AktivitetIkkeMulig:
                    return 'AktivitetIkkeMulig';
                case PeriodeEnum.Avventende:
                    return 'Avventende';
                case PeriodeEnum.Behandlingsdager:
                    return 'Behandlingsdager';
                case PeriodeEnum.Gradert:
                    return 'Gradert';
                case PeriodeEnum.Reisetilskudd:
                    return 'Reisetilskudd';
            }
        },
    },
    PreviewSoknad: {
        __resolveType: (parent) => {
            switch (parent.status) {
                case SoknadsstatusEnum.Fremtidig:
                    return 'PreviewFremtidigSoknad';
                case SoknadsstatusEnum.Korrigert:
                    return 'PreviewKorrigertSoknad';
                case SoknadsstatusEnum.Ny:
                    return 'PreviewNySoknad';
                case SoknadsstatusEnum.Sendt:
                    return 'PreviewSendtSoknad';
                default:
                    throw new Error(`Unknown søknad status: ${parent.status}`);
            }
        },
    },
    Soknad: {
        sporsmal: (parent) => {
            return parent.sporsmal.filter((sporsmal: SoknadSporsmal) => {
                switch (sporsmal.tag) {
                    case SporsmalTagEnum.VaerKlarOverAt:
                    case SporsmalTagEnum.BekreftOpplysningerUtlandInfo:
                    case SporsmalTagEnum.IkkeSoktUtenlandsoppholdInformasjon:
                        return false;
                    default:
                        return true;
                }
            });
        },
    },
};

export default objectResolvers;
