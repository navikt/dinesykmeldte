import type { Metadata } from "next";
import SoknaderPage from "./SoknaderPage";

export const metadata: Metadata = {
  title: "Søknader - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <SoknaderPage />;
};

export default Page;
