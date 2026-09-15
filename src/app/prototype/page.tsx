import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isLocalOrDemo } from "../../utils/env";
import { PrototypePage } from "./PrototypePage";

export const metadata = {
  title: "Prototype — dialogmøte 1",
  robots: { index: false, follow: false },
};

/**
 * Isolert konseptutforsking. Siden finnes bare lokalt og i demo, og rører ingen
 * produksjonsdata.
 */
export default function Page(): ReactElement {
  if (!isLocalOrDemo) {
    notFound();
  }
  return <PrototypePage />;
}
