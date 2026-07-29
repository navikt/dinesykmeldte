import { Heading, Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";
import InfoRowSkeleton from "../shared/skeletons/InfoRowSkeleton";
import SkeletonRegion from "../shared/skeletons/SkeletonRegion";

const INFO_ROWS = [
  { key: "gjelder", widths: ["55%", "40%"] },
  { key: "perioder", widths: ["60%", "42%"] },
  { key: "sporsmal-1", widths: ["52%", "36%"] },
  { key: "sporsmal-2", widths: ["48%", "38%", "30%"] },
] as const;

/**
 * Skeleton for the SoknadPanel shown on the søknad detail page.
 * Self-contained with its own SkeletonRegion.
 */
function SoknadPanelSkeleton(): ReactElement {
  return (
    <SkeletonRegion loadingText="Laster søknad">
      <section className="my-2 mb-10 flex max-w-2xl flex-col gap-1">
        <Heading as={Skeleton} size="medium">
          Plassholder overskrift
        </Heading>
        <Skeleton variant="text" width="42%" className="mb-6" />
        <ul className="list-none p-0">
          {INFO_ROWS.map(({ key, widths }) => (
            <InfoRowSkeleton key={key} widths={widths} />
          ))}
        </ul>
      </section>
    </SkeletonRegion>
  );
}

export default SoknadPanelSkeleton;
