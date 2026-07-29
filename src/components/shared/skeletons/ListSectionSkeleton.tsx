import { Heading, Skeleton, VStack } from "@navikt/ds-react";
import type { ReactElement } from "react";
import { range } from "remeda";
import LinkPanelSkeleton from "./LinkPanelSkeleton";

interface Props {
  count?: number;
}

function ListSectionSkeleton({ count = 3 }: Props): ReactElement {
  return (
    <VStack gap="space-8">
      <Heading as={Skeleton} size="medium">
        Plassholder overskrift
      </Heading>
      <VStack gap="space-24">
        {range(0, count).map((index) => (
          <LinkPanelSkeleton key={`skeleton-${index}`} />
        ))}
      </VStack>
    </VStack>
  );
}

export default ListSectionSkeleton;
