import { useApolloClient, useQuery } from "@apollo/client";
import { logger } from "@navikt/next-logger";
import {
  MineSykmeldteDocument,
  type PreviewSykmeldtFragment,
  SykmeldingByIdDocument,
  VirksomheterDocument,
} from "../graphql/queries/graphql.generated";
import useParam, { RouteLocation } from "./useParam";

type UseSykmeldt = { sykmeldtId: string; refetch: () => void } & (
  | { isLoading: true; sykmeldt: null; error: null; sykmeldtNotFound: false }
  | {
      isLoading: false;
      sykmeldt: PreviewSykmeldtFragment;
      error: null;
      sykmeldtNotFound: false;
    }
  | { isLoading: false; sykmeldt: null; error: Error; sykmeldtNotFound: false }
  | { isLoading: false; sykmeldt: null; error: null; sykmeldtNotFound: true }
);

/**
 * Must be used only in pages with sykmeldtId as path parameter
 */
export function useSykmeldt(): UseSykmeldt {
  const client = useApolloClient();
  const { sykmeldtId } = useParam(RouteLocation.Sykmeldt);

  // Load virksomheter to optimize users navigating to root
  useQuery(VirksomheterDocument);
  const { data, loading, error, refetch } = useQuery(MineSykmeldteDocument, {
    onCompleted: (result) => {
      result.mineSykmeldte?.forEach((it) => {
        it.sykmeldinger.forEach((sykmelding) => {
          client.writeQuery({
            query: SykmeldingByIdDocument,
            variables: { sykmeldingId: sykmelding.id },
            data: { __typename: "Query", sykmelding },
          });
        });
      });
    },
  });
  const relevantSykmeldt =
    data?.mineSykmeldte?.find(
      (it: PreviewSykmeldtFragment): boolean =>
        it.narmestelederId === sykmeldtId,
    ) ?? null;

  if (error) {
    return {
      sykmeldtId,
      sykmeldtNotFound: false,
      isLoading: false,
      sykmeldt: null,
      error,
      refetch,
    };
  } else if (loading && !data) {
    return {
      sykmeldtId,
      sykmeldtNotFound: false,
      isLoading: true,
      sykmeldt: null,
      error: null,
      refetch,
    };
  } else if (relevantSykmeldt) {
    return {
      sykmeldtId,
      sykmeldtNotFound: false,
      isLoading: false,
      sykmeldt: relevantSykmeldt,
      error: null,
      refetch,
    };
  } else if (error) {
    logger.error(
      new Error("Error occured while fetching sykmeldt's sykmeldinger", {
        cause: error,
      }),
    );
    return {
      sykmeldtId,
      sykmeldtNotFound: false,
      isLoading: false,
      sykmeldt: null,
      error,
      refetch,
    };
  } else {
    return {
      sykmeldtId,
      refetch,
      error: null,
      sykmeldt: null,
      isLoading: false,
      sykmeldtNotFound: true,
    };
  }
}
