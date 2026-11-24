import type {
  Tildelingsgruppe,
  Tiltakspakkevurderinger,
  TiltakspakkevurderingTiltakspakkeId,
} from "./tiltakspakkevurderingContract";

function findVirksomheter(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
) {
  return vurderinger.find((it) => it.tiltakspakkeId === tiltakspakkeId)
    ?.virksomheter;
}

/** Assignment is not the same as the boolean used to show a feature. */
export function getTildelingsgruppe(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger | undefined,
  orgnumre: ReadonlyArray<string>,
): Tildelingsgruppe {
  if (!orgnumre.length || !vurderinger) return "ukjent";
  const virksomheter = findVirksomheter(tiltakspakkeId, vurderinger);
  const grupper = new Set(
    orgnumre.map(
      (orgnummer) =>
        virksomheter?.find((it) => it.orgnummer === orgnummer)?.deltakelse,
    ),
  );
  if (grupper.has(undefined)) return "ukjent";
  if (grupper.size > 1) return "blandet";
  if (grupper.has("TILTAKSGRUPPE")) return "tiltak";
  if (grupper.has("KONTROLLGRUPPE")) return "kontroll";
  return "utenfor_scope";
}

/** Default-deny: kun `TILTAKSGRUPPE` åpner for visning. */
export function isTiltaksgruppeForOrgnummer(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnummer: string,
): boolean {
  return (
    findVirksomheter(tiltakspakkeId, vurderinger)?.some(
      (virksomhet) =>
        virksomhet.orgnummer === orgnummer &&
        virksomhet.deltakelse === "TILTAKSGRUPPE",
    ) ?? false
  );
}

/**
 * «Minst én»-regelen for «Alle virksomheter». Avklart med fag at brukeren
 * samtidig kan ha virksomheter i kontrollgruppen.
 */
export function isTiltaksgruppeForAnyOrgnummer(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnumre: ReadonlyArray<string>,
): boolean {
  return orgnumre.some((orgnummer) =>
    isTiltaksgruppeForOrgnummer(tiltakspakkeId, vurderinger, orgnummer),
  );
}
