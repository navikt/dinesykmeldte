"use client";

import type { ReactElement } from "react";
import AnsvarVedSykefravaer from "../AnsvarVedSykefravaer/AnsvarVedSykefravaer";
import { useVisKomIGangTidlig } from "../komigangtidlig/useVisKomIGangTidlig";
import NarmestelederInfo from "./NarmestelederInfo";

function NarmestelederInfoSection(): ReactElement | null {
  const { visKomIGangTidlig: visAnsvarsseksjon, erAvklart } =
    useVisKomIGangTidlig();

  if (!erAvklart) return null;

  return visAnsvarsseksjon ? <AnsvarVedSykefravaer /> : <NarmestelederInfo />;
}

export default NarmestelederInfoSection;
