"use client";

import { useApmRouteTracking } from "@nais/apm/react";
import { usePathname } from "next/navigation";

export function ApmRouteTracker() {
  const pathname = usePathname();

  // Faro deduplicates before beforeSend. Keep the raw pathname distinct until
  // our browser sanitizer normalizes route_change attributes for transport.
  useApmRouteTracking(pathname);

  return null;
}
