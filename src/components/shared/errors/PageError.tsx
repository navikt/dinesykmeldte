import { PersonSuitIcon } from "@navikt/aksel-icons";
import { BodyLong, Button, Heading, Link } from "@navikt/ds-react";
import Image from "next/image";
import type { ReactElement, ReactNode } from "react";
import { useLogAmplitudeEvent } from "../../../amplitude/amplitude";
import { browserEnv } from "../../../utils/env";
import { cleanId } from "../../../utils/stringUtils";
import notFoundMom from "./svgs/not-found-mom.svg";
import pageErrorDad from "./svgs/page-error-dad.svg";

interface Props {
  graphic?: "dad" | "mom";
  text?: string;
  cause: string;
  details?: ReactNode;
  action?: ReactNode | null;
  noReload?: boolean;
}

const PageError = ({
  graphic = "dad",
  text,
  cause,
  details,
  action,
  noReload = false,
}: Props): ReactElement => {
  const pageErrorId = cleanId(cause);
  const errorText = text ?? "Det har oppstått en uforventet feil";

  useLogAmplitudeEvent(
    {
      eventName: "guidepanel vist",
      data: { tekst: errorText, komponent: "PageError" },
    },
    { cause },
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" is semantically correct for dynamic error messages
    <div
      className="mb-16 flex max-w-3xl gap-4 max-[960px]:flex-col"
      role="status"
      aria-live="polite"
      aria-labelledby={pageErrorId}
    >
      <div className="relative h-64 w-96 grow self-center">
        {graphic === "dad" ? (
          <Image src={pageErrorDad} alt="" fill aria-hidden />
        ) : (
          <Image src={notFoundMom} alt="" fill aria-hidden />
        )}
      </div>
      <div>
        <Heading id={pageErrorId} spacing size="medium" level="2">
          {errorText}
        </Heading>
        <BodyLong spacing={!details}>
          {!noReload && (
            <>
              Du kan prøve å{" "}
              <Link href={browserEnv.publicPath}>laste siden på nytt</Link>.
            </>
          )}
        </BodyLong>
        {details ?? (
          <BodyLong spacing>Vi jobber allerede med å fikse feilen.</BodyLong>
        )}
        <BodyLong spacing className="mt-4 font-bold">
          {action ??
            "Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36."}
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
};

export default PageError;
