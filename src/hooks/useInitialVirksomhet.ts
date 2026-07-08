"use client";

import { useSearchParams } from "next/navigation";

export const useInitialVirksomhet = (queryParam = "bedrift") => {
  const searchParams = useSearchParams();
  const initialVirksomhet = searchParams?.get(queryParam) ?? null;

  return initialVirksomhet;
};
