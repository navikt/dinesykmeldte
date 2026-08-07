import { Heading, Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";
import InfoRowSkeleton from "../shared/skeletons/InfoRowSkeleton";
import SkeletonRegion from "../shared/skeletons/SkeletonRegion";

const INFO_ROWS = [
  { key: "gjelder", widths: ["55%", "40%"] },
  { key: "perioder", widths: ["60%", "42%"] },
  { key: "annen", widths: ["50%"] },
] as const;

/**
 * Compact skeleton for the SykmeldingPanelShort embedded at the bottom of the
 * søknad detail page. Self-contained with its own SkeletonRegion.
 */
function SykmeldingPanelShortSkeleton(): ReactElement {
  return (
    <SkeletonRegion loadingText="Laster sykmelding">
      <section className="max-w-2xl">
        <Heading as={Skeleton} size="medium">
          Plassholder overskrift
        </Heading>
        <Skeleton variant="text" width="42%" className="mb-4" />
        <ul className="list-none p-0">
          {INFO_ROWS.map(({ key, widths }) => (
            <InfoRowSkeleton key={key} widths={widths} />
          ))}
        </ul>
      </section>
    </SkeletonRegion>
  );
}

export default SykmeldingPanelShortSkeleton;
