"use client";

import {
  createSporsmalOgSvarBreadcrumbs,
  useUpdateBreadcrumbs,
} from "../../../hooks/useBreadcrumbs";

export function SporsmalOgSvarBreadcrumbs(): null {
  useUpdateBreadcrumbs(() => createSporsmalOgSvarBreadcrumbs(), []);
  return null;
}
