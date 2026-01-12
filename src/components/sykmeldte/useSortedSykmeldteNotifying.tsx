import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { PreviewSykmeldtFragment } from "../../graphql/queries/graphql.generated";
import useSelectedVirksomhet from "../../hooks/useSelectedSykmeldt";
import { SortByState } from "../../state/sortByNotifyingSlice";
import { RootState } from "../../state/store";
import {
  SykmeldteWithLatestNotifyingDate,
  getLatestNotifyingDates,
  sortedByNotifyingDates,
} from "../../utils/sortByNotifying";
import { sortByName } from "../../utils/sykmeldtUtils";
import { filterSykmeldteByOrg } from "./useFilteredSykmeldte";

export function sortNotifyingSykmeldteBySelectedSort(
  state: SortByState,
  sykmeldte: PreviewSykmeldtFragment[],
): PreviewSykmeldtFragment[] {
  switch (state.sortBy) {
    case "latest":
      return sortedByNotifyingDates(sykmeldte, "latest");
    case "oldest":
      return sortedByNotifyingDates(sykmeldte, "oldest");
    case "name":
      return [...sykmeldte].sort(sortByName);
    default:
      return sykmeldte;
  }
}

function initialFilterSort(
  sortBy: SortByState,
  virksomhet: string,
  sykmeldte: PreviewSykmeldtFragment[] | null | undefined,
): PreviewSykmeldtFragment[] {
  const filteredByOrg = filterSykmeldteByOrg(virksomhet, sykmeldte ?? []);
  return sortNotifyingSykmeldteBySelectedSort(sortBy, filteredByOrg);
}

function useSortedSykmeldteNotifying(
  sykmeldte?: PreviewSykmeldtFragment[] | null,
): {
  sortedSykmeldteWithDateAndText: SykmeldteWithLatestNotifyingDate[];
} {
  const router = useRouter();
  const initialVirksomhet =
    (router.query.bedrift as string | undefined) ?? null;

  const sorting = useSelector((state: RootState) => state.sortByNotifying);
  const virksomhet = useSelectedVirksomhet();
  const [sortedSykmeldte, setSortedSykmeldte] = useState(
    initialFilterSort(sorting, initialVirksomhet ?? virksomhet, sykmeldte),
  );
  const sykmeldteWithDateAndText = getLatestNotifyingDates(sortedSykmeldte);

  useEffect(() => {
    (async () => {
      setSortedSykmeldte(
        initialFilterSort(sorting, virksomhet, sykmeldte ?? []),
      );
    })();
  }, [sykmeldte, sorting, virksomhet]);

  return { sortedSykmeldteWithDateAndText: sykmeldteWithDateAndText ?? [] };
}

export default useSortedSykmeldteNotifying;
