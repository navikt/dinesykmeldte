import { Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";
import ListSectionSkeleton from "../shared/skeletons/ListSectionSkeleton";
import SkeletonRegion from "../shared/skeletons/SkeletonRegion";

/**
 * Skeleton for the root SykmeldteList page.
 *
 * Mirrors the structure of the loaded page:
 * - Mobile-only VirksomhetPicker placeholder
 * - Two list sections (Varslinger + Sykmeldte uten varsel)
 */
function SykmeldteListSkeleton(): ReactElement {
  return (
    <SkeletonRegion loadingText="Laster dine ansatte">
      {/* Mirrors the mobile VirksomhetPicker (hidden on desktop) */}
      <div className="hidden max-[720px]:mb-4 max-[720px]:mt-12 max-[720px]:block">
        <Skeleton variant="rounded" width="100%" height={48} />
      </div>
      <div className="flex flex-col gap-16">
        <ListSectionSkeleton count={2} />
        <ListSectionSkeleton count={3} />
      </div>
    </SkeletonRegion>
  );
}

export default SykmeldteListSkeleton;
