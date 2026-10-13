import { useQuery } from "@apollo/client";
import { MineSykmeldteDocument } from "../../graphql/queries/graphql.generated";
import { useInitialVirksomhet } from "../../hooks/useInitialVirksomhet";
import useSelectedVirksomhet from "../../hooks/useSelectedSykmeldt";
import { filterSykmeldteByOrg } from "../sykmeldte/useFilteredSykmeldte";

export function useIsMoreThan5SykmeldteInSelectedVirksomhet(): boolean {
  const initialVirksomhet = useInitialVirksomhet();

  const { data } = useQuery(MineSykmeldteDocument);
  const selectedVirksomhet = useSelectedVirksomhet();

  if (!data?.mineSykmeldte?.length) return false;

  return (
    filterSykmeldteByOrg(
      initialVirksomhet ?? selectedVirksomhet,
      data.mineSykmeldte,
    ).length >= 5
  );
}
