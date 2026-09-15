"use client";

import { BodyShort, Button, Detail, Modal, VStack } from "@navikt/ds-react";
import { type ReactElement, useState } from "react";
import LinkButton from "../../components/shared/links/LinkButton";
import type { Ansatt } from "../types";
import styles from "./OmAnsatt.module.css";

interface Props {
  ansatt: Ansatt;
  onRemove: (ansatt: Ansatt) => void;
}

/** Demonstrates the existing leader relationship action without sending a request. */
export function OmAnsatt({ ansatt, onRemove }: Props): ReactElement {
  const [visBekreftelse, setVisBekreftelse] = useState(false);
  const fornavn = ansatt.navn.split(" ")[0];

  return (
    <>
      <dl
        className={styles.details}
        aria-label={`Opplysninger om ${ansatt.navn}`}
      >
        <div>
          <dt>Virksomhet</dt>
          <dd>
            {ansatt.orgnavn}
            <Detail>Organisasjonsnummer {ansatt.orgnummer}</Detail>
          </dd>
        </div>
        <div>
          <dt>Fødselsnummer</dt>
          <dd>{ansatt.fnrMaskert}</dd>
        </div>
        <div className={styles.remove}>
          <dt>Ikke din ansatt?</dt>
          <dd>
            <LinkButton onClick={() => setVisBekreftelse(true)}>
              Fjern fra min oversikt
            </LinkButton>
          </dd>
        </div>
      </dl>

      {visBekreftelse && (
        <Modal
          open
          width={560}
          onClose={() => setVisBekreftelse(false)}
          header={{ heading: "Meld fra om endring" }}
        >
          <Modal.Body>
            <VStack gap="space-24">
              <BodyShort>
                Du melder fra om at du ikke lenger skal være registrert som
                nærmeste leder for <strong>{ansatt.navn}</strong> i{" "}
                <strong>{ansatt.orgnavn}</strong>.
              </BodyShort>
              <BodyShort>
                Hvis {fornavn} fortsatt er ansatt i virksomheten, vil det bli
                sendt en ny forespørsel i Altinn om å oppgi nærmeste leder.
              </BodyShort>
              <Detail className={styles.demoNote}>
                Dette er en fiktiv person. I demoen fjernes personen bare fra
                visningen. Ingen endring eller forespørsel sendes.
              </Detail>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button
              data-color="danger"
              onClick={() => {
                setVisBekreftelse(false);
                onRemove(ansatt);
              }}
            >
              Ja, fjern fra min oversikt
            </Button>
            <Button
              variant="secondary"
              onClick={() => setVisBekreftelse(false)}
            >
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
