"use client";

import { PersonGroupIcon } from "@navikt/aksel-icons";
import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import NarmestelederInfoSection from "../../components/NarmestelederInfo/NarmestelederInfoSection";
import SykmeldteInfoPanel from "../../components/SykmeldtInfoPanel/SykmeldteInfoPanel";
import SykmeldteList from "../../components/sykmeldte/SykmeldteList";
import VirksomhetPicker from "../../components/virksomhetpicker/VirksomhetPicker";
import { useUpdateBreadcrumbs } from "../../hooks/useBreadcrumbs";

export const SykmeldtIdPage = ({
  stegoversiktAktiv = false,
}: {
  readonly stegoversiktAktiv?: boolean;
}) => {
  useUpdateBreadcrumbs(() => []);

  return (
    <PageContainer
      header={{ Icon: PersonGroupIcon, title: "Dine sykmeldte" }}
      headerRight={<VirksomhetPicker />}
    >
      <SykmeldteInfoPanel stegoversiktAktiv={stegoversiktAktiv} />
      <SykmeldteList />
      <NarmestelederInfoSection stegoversiktAktiv={stegoversiktAktiv} />
    </PageContainer>
  );
};
