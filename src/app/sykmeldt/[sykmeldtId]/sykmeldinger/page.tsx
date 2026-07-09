import type { Metadata } from "next";
import SykmeldingerPage from "./SykmeldingerPage";

export const metadata: Metadata = {
  title: "Sykmeldinger - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <SykmeldingerPage />;
};

export default Page;
