import type {
  Tildelingsgruppe,
  TiltakspakkeId,
  TiltakspakkevurderingDeltakelse,
  Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";

function findParticipations(
  tiltakspakkeId: TiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnumre: ReadonlyArray<string>,
): ReadonlyArray<TiltakspakkevurderingDeltakelse | undefined> {
  const virksomheter =
    vurderinger.find((it) => it.tiltakspakkeId === tiltakspakkeId)
      ?.virksomheter ?? [];
  return orgnumre.map(
    (orgnummer) =>
      virksomheter.find((it) => it.orgnummer === orgnummer)?.deltakelse,
  );
}

/** Tildelingen til telemetri, ikke det samme som om noe skal vises. */
export function getTildelingsgruppe(
  tiltakspakkeId: TiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger | undefined,
  orgnumre: ReadonlyArray<string>,
): Tildelingsgruppe {
  if (!vurderinger || !orgnumre.length) return "ukjent";
  const grupper = new Set(
    findParticipations(tiltakspakkeId, vurderinger, orgnumre),
  );
  if (grupper.has(undefined)) return "ukjent";
  if (grupper.size > 1) return "blandet";
  if (grupper.has("TILTAKSGRUPPE")) return "tiltak";
  if (grupper.has("KONTROLLGRUPPE")) return "kontroll";
  return "utenfor_scope";
}

/** Default-deny: vises bare når minst én virksomhet er i `TILTAKSGRUPPE`. */
export function isTiltaksgruppeForAnyOrgnummer(
  tiltakspakkeId: TiltakspakkeId,
  vurderinger: Tiltakspakkevurderinger,
  orgnumre: ReadonlyArray<string>,
): boolean {
  return findParticipations(tiltakspakkeId, vurderinger, orgnumre).includes(
    "TILTAKSGRUPPE",
  );
}
