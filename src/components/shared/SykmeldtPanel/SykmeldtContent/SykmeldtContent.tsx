import React, { type ReactElement } from "react";
import type { PreviewSykmeldtFragment } from "../../../../graphql/queries/graphql.generated";
import AktivitetsvarselLink from "./Links/AktivitetsvarselLink";
import DialogmoteLink from "./Links/DialogmoteLink";
import OppfolgingsplanLink from "./Links/OppfolgingsplanLink";
import SoknaderLink from "./Links/SoknaderLink";
import SykmeldingerLink from "./Links/SykmeldingerLink";

interface Props {
  sykmeldt: PreviewSykmeldtFragment;
  notification: boolean;
}

function SykmeldtContent({ sykmeldt }: Props): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <SykmeldingerLink
        sykmeldtId={sykmeldt.narmestelederId}
        sykmeldinger={sykmeldt.sykmeldinger}
      />
      <SoknaderLink
        sykmeldtId={sykmeldt.narmestelederId}
        soknader={sykmeldt.previewSoknader}
      />
      <DialogmoteLink
        sykmeldtId={sykmeldt.narmestelederId}
        dialogmoter={sykmeldt.dialogmoter}
      />
      <OppfolgingsplanLink
        sykmeldtId={sykmeldt.narmestelederId}
        pilotUser={sykmeldt.pilotUser}
        oppfolgingsplaner={sykmeldt.oppfolgingsplaner}
      />
      <AktivitetsvarselLink
        sykmeldtId={sykmeldt.narmestelederId}
        aktivitetsvarsler={sykmeldt.aktivitetsvarsler}
      />
    </div>
  );
}

export default SykmeldtContent;
