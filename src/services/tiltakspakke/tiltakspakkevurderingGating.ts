import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tildelingsgruppe,
  type Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";

/** Assignment is not the same as the boolean used to show a feature. */
export function getTildelingsgruppe(
  vurderinger: Tiltakspakkevurderinger | undefined,
  orgnumre: ReadonlyArray<string>,
): Tildelingsgruppe {
  if (!orgnumre.length || !vurderinger) return "ukjent";
  const virksomheter = vurderinger.find(
    (it) => it.tiltakspakkeId === OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  )?.virksomheter;
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
 * virksomheten i `OPPFOLGINGSPLAN_TILTAKSPAKKE_1` åpner for visning. Alt annet
 * (fravær, tom liste, andre grupper, ukjent orgnummer) betyr «ikke vis».
 *
 * Dette er den eneste tolkningen av tiltakspakkevurderinger i frontend. Alle
 * konsumenter (påminnelsesmodulen og «Kom i gang tidlig»-boksen) skal gå via
 * hookene i `useTiltakspakkevurdering`, som bruker denne funksjonen, slik at
 * gating-reglene ikke kan divergere mellom flatene.
 */
export function isTiltaksgruppeForOrgnummer(
  vurderinger: Tiltakspakkevurderinger,
  orgnummer: string,
): boolean {
  return vurderinger.some(
    (vurdering) =>
      vurdering.tiltakspakkeId === OPPFOLGINGSPLAN_TILTAKSPAKKE_1 &&
      vurdering.virksomheter.some(
        (virksomhet) =>
          virksomhet.orgnummer === orgnummer &&
          virksomhet.deltakelse === "TILTAKSGRUPPE",
      ),
  );
}

/**
 * «Minst én»-regelen for en flate som viser flere virksomheter samtidig
 * («Alle virksomheter»): vurderingen åpner for visning dersom minst én av
 * brukerens virksomheter er i tiltaksgruppen for
 * `OPPFOLGINGSPLAN_TILTAKSPAKKE_1`.
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
  vurderinger: Tiltakspakkevurderinger,
  orgnumre: ReadonlyArray<string>,
): boolean {
  return orgnumre.some((orgnummer) =>
    isTiltaksgruppeForOrgnummer(vurderinger, orgnummer),
  );
}
