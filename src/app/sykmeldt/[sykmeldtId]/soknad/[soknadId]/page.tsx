import type { Metadata } from "next";
import SoknadPage from "./SoknadPage";

export const metadata: Metadata = {
  title: "Søknad - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <SoknadPage />;
};

export default Page;
