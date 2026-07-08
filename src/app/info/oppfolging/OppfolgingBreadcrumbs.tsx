"use client";

import {
  createOppfolgingBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../hooks/useBreadcrumbs";

export function OppfolgingBreadcrumbs(): null {
  useUpdateBreadcrumbs(() => createOppfolgingBreadcrumbs(), []);
  return null;
}
