import type { Metadata } from "next";
import { SykmeldtIdPage } from "./SykmeldtIdPage";

export const metadata: Metadata = {
  title: "Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <SykmeldtIdPage />;
};

export default Page;
