import { useRouter } from "next/router";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import expandedSlice from "../../state/expandedSlice";
import type { RootState } from "../../state/store";

type ToggleExpand = (id: string, where: "root" | "periods") => void;

export function useExpandSykmeldte(
  focusSykmeldtId: string | null,
  expandedSykmeldte: string[],
): ToggleExpand {
  const dispatch = useDispatch();
  const router = useRouter();

  return useCallback(
    (id, where) => {
      if (where === "root") {
        if (focusSykmeldtId === id && expandedSykmeldte.includes(id)) {
          router.replace("/", "/", { scroll: false });
        }
        dispatch(expandedSlice.actions.toggleExpandSykmeldte(id));
      } else {
        dispatch(expandedSlice.actions.toggleExpandSykmeldtPerioder(id));
      }
    },
    [dispatch, expandedSykmeldte, focusSykmeldtId, router],
  );
}

export function useExpanded(): {
  expandedSykmeldte: string[];
  expandedSykmeldtPerioder: string[];
} {
  const expandedSykmeldte = useSelector(
    (state: RootState) => state.expanded.expandedSykmeldte,
  );
  const expandedSykmeldtPerioder = useSelector(
    (state: RootState) => state.expanded.expandedSykmeldtPerioder,
  );

  return { expandedSykmeldte, expandedSykmeldtPerioder };
}
