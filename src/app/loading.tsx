import { Box, HStack, Skeleton, VStack } from "@navikt/ds-react";
import ListSectionSkeleton from "../components/shared/skeletons/ListSectionSkeleton";
import SkeletonRegion from "../components/shared/skeletons/SkeletonRegion";

export default function Loading() {
  return (
    <SkeletonRegion loadingText="Laster innhold">
      {/* PageContainer header placeholder */}
      <Box
        background="default"
        paddingBlock="space-24"
        paddingInline={{ xs: "space-16", md: "space-24" }}
        borderWidth="0 0 4 0"
        borderColor="accent-strong"
      >
        <div className="mx-auto w-full max-w-[50rem]">
          <HStack align="center" gap="space-16">
            <Skeleton variant="rounded" width={32} height={32} />
            <Skeleton variant="text" width={200} />
          </HStack>
        </div>
      </Box>

      {/* Content area */}
      <Box
        paddingBlock="space-48 space-56"
        paddingInline={{ xs: "space-16", md: "space-24" }}
      >
        <div className="mx-auto w-full max-w-[50rem]">
          <VStack gap="space-16">
            <ListSectionSkeleton count={2} />
            <ListSectionSkeleton count={3} />
          </VStack>
        </div>
      </Box>
    </SkeletonRegion>
  );
}
