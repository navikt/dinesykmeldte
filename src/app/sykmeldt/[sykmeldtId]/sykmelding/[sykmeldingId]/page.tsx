import type { Metadata } from "next";
import SykmeldingPage from "./SykmeldingPage";

export const metadata: Metadata = {
  title: "Sykmelding - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <SykmeldingPage />;
};

export default Page;
