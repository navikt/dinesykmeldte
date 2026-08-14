"use client";

import { PersonGroupIcon } from "@navikt/aksel-icons";
import { PageContainer } from "@navikt/dinesykmeldte-sidemeny";
import DialogmoteInfoPanel from "../../components/DialogmoteInfoPanel/DialogmoteInfoPanel";
import NarmestelederInfo from "../../components/NarmestelederInfo/NarmestelederInfo";
import SykmeldteInfoPanel from "../../components/SykmeldtInfoPanel/SykmeldteInfoPanel";
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
      <SykmeldteInfoPanel />
      <DialogmoteInfoPanel />
      <SykmeldteList />
      <NarmestelederInfo />
    </PageContainer>
  );
};
