import type {
  Tildelingsgruppe,
  Tiltakspakkevurderinger,
  TiltakspakkevurderingTiltakspakkeId,
} from "./tiltakspakkevurderingContract";

function finnVirksomheter(
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
  const virksomheter = finnVirksomheter(tiltakspakkeId, vurderinger);
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

/**
 * Default-deny gating: kun `deltakelse === "TILTAKSGRUPPE"` for den relevante
 * virksomheten i den oppgitte tiltakspakken åpner for visning. Alt annet
 * (fravær av pakken, tom liste, andre grupper, ukjent orgnummer) betyr
 * «ikke vis». Tiltaksgruppen i én pakke åpner aldri en annen pakke.
 *
 * Dette er den eneste tolkningen av tiltakspakkevurderinger i frontend. Alle
 * konsumenter skal gå via hookene i `useTiltakspakkevurdering`, som bruker
 * denne funksjonen, slik at gating-reglene ikke kan divergere mellom flatene.
 */
export function isTiltaksgruppeForOrgnummer(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnummer: string,
): boolean {
  return (
    finnVirksomheter(tiltakspakkeId, vurderinger)?.some(
      (virksomhet) =>
        virksomhet.orgnummer === orgnummer &&
        virksomhet.deltakelse === "TILTAKSGRUPPE",
    ) ?? false
  );
}

/**
 * «Minst én»-regelen for en flate som viser flere virksomheter samtidig
 * («Alle virksomheter»): vurderingen åpner for visning dersom minst én av
 * brukerens virksomheter er i tiltaksgruppen for den oppgitte tiltakspakken.
 *
 * Regelen er avklart med fag: det er akseptert at brukeren samtidig kan ha
 * virksomheter i kontrollgruppen — innholdet er generell informasjon, og
 * brukeren har allerede en virksomhet som er i tiltaksgruppen. Er en konkret
 * virksomhet valgt, sendes kun den inn, og da er dette identisk med
 * `isTiltaksgruppeForOrgnummer`.
 *
 * Default-deny er bevart: tom liste, ukjente orgnumre, kontrollgruppe,
 * utenfor scope og manglende vurdering gir alle `false`.
 */
export function isTiltaksgruppeForMinstEttOrgnummer(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnumre: ReadonlyArray<string>,
): boolean {
  return orgnumre.some((orgnummer) =>
    isTiltaksgruppeForOrgnummer(tiltakspakkeId, vurderinger, orgnummer),
  );
}
