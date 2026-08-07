import type { Metadata } from "next";
import MeldingerPage from "./MeldingerPage";

export const metadata: Metadata = {
  title: "Meldinger - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <MeldingerPage />;
};

export default Page;
