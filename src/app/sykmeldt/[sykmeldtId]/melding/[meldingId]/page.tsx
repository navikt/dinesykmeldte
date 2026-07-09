import type { Metadata } from "next";
import MeldingPage from "../../meldinger/MeldingerPage";

export const metadata: Metadata = {
  title: "Melding - Dine Sykmeldte - nav.no",
};

const Page = async () => {
  return <MeldingPage />;
};

export default Page;
