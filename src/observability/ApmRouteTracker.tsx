"use client";

import { useApmRouteTracking } from "@nais/apm/react";
import { usePathname } from "next/navigation";
import { normalizeBrowserPath } from "./browser";

export function ApmRouteTracker() {
  const pathname = usePathname();
  useApmRouteTracking(pathname ? normalizeBrowserPath(pathname) : null);
  return null;
}
