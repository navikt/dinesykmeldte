import { Box, HStack, Skeleton } from "@navikt/ds-react";
import type { ReactElement } from "react";

function LinkPanelSkeleton(): ReactElement {
  return (
    <Box
      paddingBlock="space-16"
      paddingInline="space-20"
      borderRadius="8"
      borderWidth="1"
      borderColor="neutral-subtleA"
    >
      <HStack gap="space-16" align="start">
        <Skeleton variant="rounded" width={24} height={24} />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="55%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </HStack>
    </Box>
  );
}

export default LinkPanelSkeleton;
