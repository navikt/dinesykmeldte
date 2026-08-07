import { Heading, Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";
import InfoRowSkeleton from "../shared/skeletons/InfoRowSkeleton";
import SkeletonRegion from "../shared/skeletons/SkeletonRegion";

const INFO_ROWS = [
  { key: "gjelder", widths: ["55%", "40%"] },
  { key: "perioder", widths: ["60%", "45%", "38%"] },
  { key: "annen", widths: ["52%"] },
  { key: "mulighet", widths: ["58%", "44%"] },
] as const;

function SykmeldingPanelSkeleton(): ReactElement {
  return (
    <SkeletonRegion loadingText="Laster sykmelding">
      <section className="my-2 flex max-w-2xl flex-col gap-1">
        <Heading as={Skeleton} size="medium">
          Plassholder overskrift
        </Heading>
        <Skeleton variant="text" width="40%" className="mb-6" />
        <ul className="list-none p-0">
          {INFO_ROWS.map(({ key, widths }) => (
            <InfoRowSkeleton key={key} widths={widths} />
          ))}
        </ul>
      </section>
    </SkeletonRegion>
  );
}

export default SykmeldingPanelSkeleton;
