import {
  PeriodeEnum,
  Resolvers,
  SoknadsstatusEnum,
} from "./resolvers.generated";

const objectResolvers: Partial<Resolvers> = {
  Periode: {
    __resolveType: (parent) => {
      switch (parent.type) {
        case PeriodeEnum.AktivitetIkkeMulig:
          return "AktivitetIkkeMulig";
        case PeriodeEnum.Avventende:
          return "Avventende";
        case PeriodeEnum.Behandlingsdager:
          return "Behandlingsdager";
        case PeriodeEnum.Gradert:
          return "Gradert";
        case PeriodeEnum.Reisetilskudd:
          return "Reisetilskudd";
      }
    },
  },
  PreviewSoknad: {
    __resolveType: (parent) => {
      switch (parent.status) {
        case SoknadsstatusEnum.Fremtidig:
          return "PreviewFremtidigSoknad";
        case SoknadsstatusEnum.Ny:
          return "PreviewNySoknad";
        case SoknadsstatusEnum.Sendt:
          return "PreviewSendtSoknad";
        default:
          throw new Error(`Unknown søknad status: ${parent.status}`);
      }
    },
  },
};

export default objectResolvers;
