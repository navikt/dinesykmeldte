import * as mineSykmeldteService from "../../services/minesykmeldte/mineSykmeldteService";
import objectResolvers from "./objectResolvers";
import type {
  MutationResolvers,
  PreviewSykmeldt,
  QueryResolvers,
  Resolvers,
  Soknad,
  Sykmelding,
  Virksomhet,
} from "./resolvers.generated";
import { withBackendFailure } from "./withBackendFailure";

const Query: QueryResolvers = {
  virksomheter: async (_, _args, context): Promise<Virksomhet[]> => {
    return withBackendFailure("virksomheterFetchFailed", () =>
      mineSykmeldteService.getVirksomheter(context),
    );
  },
  mineSykmeldte: (_, _args, context): Promise<PreviewSykmeldt[]> => {
    return withBackendFailure("mineSykmeldteFetchFailed", () =>
      mineSykmeldteService.getMineSykmeldte(context),
    );
  },
  sykmelding: (_, args, context): Promise<Sykmelding> => {
    return withBackendFailure("sykmeldingFetchFailed", () =>
      mineSykmeldteService.getSykmelding(args.sykmeldingId, context),
    );
  },
  soknad: (_, args, context): Promise<Soknad> => {
    return withBackendFailure("soknadFetchFailed", () =>
      mineSykmeldteService.getSoknad(args.soknadId, context),
    );
  },
};

const Mutation: MutationResolvers = {
  read: async (_, args, context) => {
    return withBackendFailure("readFailed", () =>
      mineSykmeldteService.markRead(args.type, args.id, context),
    );
  },
  unlinkSykmeldt: async (_, args, context) => {
    return withBackendFailure("unlinkSykmeldtFailed", () =>
      mineSykmeldteService.unlinkSykmeldt(args.sykmeldtId, context),
    );
  },
  markAllSykmeldingerAndSoknaderAsRead: async (_, _args, context) => {
    return withBackendFailure("markAllReadFailed", () =>
      mineSykmeldteService.markAllSykmeldingerAndSoknaderAsRead(context),
    );
  },
};

const resolvers: Partial<Resolvers> = {
  Query,
  Mutation,
  ...objectResolvers,
};

export default resolvers;
