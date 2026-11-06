import type { Metadata } from "next";
import { isStegoversiktFeatureToggleEnabled } from "../../utils/env";
import { SykmeldtIdPage } from "./SykmeldtIdPage";

export const metadata: Metadata = {
  title: "Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return (
    <SykmeldtIdPage stegoversiktAktiv={isStegoversiktFeatureToggleEnabled()} />
  );
};

export default Page;
