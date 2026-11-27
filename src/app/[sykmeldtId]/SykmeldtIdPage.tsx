"use client";

import { PersonGroupIcon } from "@navikt/aksel-icons";
import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import NarmestelederInfoSection from "../../components/NarmestelederInfoSection/NarmestelederInfoSection";
import SykmeldteInfoSection from "../../components/SykmeldteInfoSection/SykmeldteInfoSection";
import SykmeldteList from "../../components/sykmeldte/SykmeldteList";
import VirksomhetPicker from "../../components/virksomhetpicker/VirksomhetPicker";
import { useUpdateBreadcrumbs } from "../../hooks/useBreadcrumbs";

export const SykmeldtIdPage = () => {
  useUpdateBreadcrumbs(() => []);

  return (
    <PageContainer
      header={{ Icon: PersonGroupIcon, title: "Dine sykmeldte" }}
      headerRight={<VirksomhetPicker />}
    >
      <SykmeldteInfoSection />
      <SykmeldteList />
      <NarmestelederInfoSection />
    </PageContainer>
  );
};
