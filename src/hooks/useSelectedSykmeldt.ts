"use client";

import { useQuery } from "@apollo/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VirksomheterDocument } from "../graphql/queries/graphql.generated";
import filterSlice from "../state/filterSlice";
import type { RootState } from "../state/store";
import { useInitialVirksomhet } from "./useInitialVirksomhet";

function useSelectedVirksomhet(): "all" | string {
  useInitialBedriftQueryParam();

  const virksomhet = useSelector((state: RootState) => state.filter.virksomhet);
  const { data: queryData, loading } = useQuery(VirksomheterDocument);

  if (
    !loading &&
    !queryData?.virksomheter.some((it) => it.orgnummer === virksomhet)
  ) {
    return "all";
  }

  if (virksomhet) {
    return virksomhet;
  }

  if (!queryData) {
    return "";
  }

  if (queryData.virksomheter.length === 0) {
    return "";
  }

  return "all";
}

function useInitialBedriftQueryParam(): void {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialBedrift = useInitialVirksomhet();
  const hasFixedUrlRef = useRef(false);

  useEffect(() => {
    if (
      hasFixedUrlRef.current ||
      initialBedrift == null ||
      initialBedrift === "" ||
      searchParams === null ||
      pathname === null
    )
      return;

    dispatch(filterSlice.actions.setVirksomhet(initialBedrift));

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("bedrift");

    const nextUrl =
      nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;

    if (nextUrl === pathname) {
      hasFixedUrlRef.current = true;
      return;
    }

    router.replace(nextUrl, { scroll: false });
    hasFixedUrlRef.current = true;
  }, [dispatch, initialBedrift, pathname, router, searchParams]);
}

export default useSelectedVirksomhet;
