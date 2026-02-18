import { PersonSuitIcon } from "@navikt/aksel-icons";
import { BodyLong, Button, Heading } from "@navikt/ds-react";
import Image from "next/image";
import type { ReactElement } from "react";
import TilbakeLink from "../TilbakeLink/TilbakeLink";
import notFoundMom from "./svgs/not-found-mom.svg";

function SykmeldtNotFound(): ReactElement {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" is semantically correct for dynamic status messages
    <div
      className="mb-16 flex max-w-3xl gap-4 max-[960px]:flex-col"
      role="status"
      aria-live="polite"
      aria-labelledby="sykmeldt-not-found"
    >
      <div className="relative h-64 w-96 grow self-center">
        <Image src={notFoundMom} alt="" fill aria-hidden />
      </div>
      <div className="max-w-prose basis-2/3">
        <TilbakeLink
          href="/"
          text="Tilbake til dine sykmeldte"
          marginTop={false}
          marginBottom={false}
        />
        <Heading id="sykmeldt-not-found" spacing size="medium" level="2">
          Sykmeldt arbeidstaker ikke tilgjengelig
        </Heading>
        <BodyLong spacing>
          Det kan bety at den sykmeldte ikke lengre er koblet til deg som
          arbeidstaker, eller at du har prøvd å gå til en arbeidstaker som har
          en annen nærmesteleder i din bedrift.
        </BodyLong>
        <BodyLong spacing>
          Dersom du navigerte deg hit fra et bokmerke, må du huske å oppdatere
          bokmerket i nettleseren din.
        </BodyLong>
        <BodyLong spacing className="font-bold">
          Dersom problemet vedvarer kan du kontakte oss på
          arbeidsgivertelefonen: 55 55 33 36.
        </BodyLong>
        <Button
          className="mt-4"
          as="a"
          href="https://www.nav.no/no/bedrift"
          variant="tertiary"
          icon={<PersonSuitIcon role="img" aria-hidden />}
        >
          Tilbake til arbeidsgiversiden
        </Button>
      </div>
    </div>
  );
}

export default SykmeldtNotFound;
