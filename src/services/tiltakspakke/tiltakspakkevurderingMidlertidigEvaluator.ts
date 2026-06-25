import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "./tiltakspakkevurderingContract";

/**
 * Råformat for en tiltakspakkevurdering slik Flaggskipet er forventet å svare.
 * Feltene er bevisst løse (nullable) fordi de valideres mot kontrakten i
 * service/orchestrator-laget før de slippes ut av BFF-en.
 */
export type RawTiltakspakkevurdering = {
  orgnummer?: string | null;
  status?: string | null;
  toggleId?: string | null;
};

/**
 * Evaluerer kun de autoriserte orgnumrene den får inn. Konsument-BFF-en eier å
 * finne og validere autoriserte orgnumre i egen kontekst – denne funksjonen
 * (og den ekte Flaggskipet-integrasjonen i #740) skal aldri selv slå opp hvem
 * brukeren representerer.
 */
export type EvaluerOrgnumre = (
  autoriserteOrgnumre: string[],
) => Promise<RawTiltakspakkevurdering[]>;

/**
 * Midlertidig mock-evaluator som markerer alle autoriserte orgnumre som
 * TILTAKSGRUPPE. Byttes ut med den ekte Flaggskipet-integrasjonen i #740.
 */
export const evaluerOrgnumreMidlertidig: EvaluerOrgnumre = async (
  autoriserteOrgnumre,
) =>
  autoriserteOrgnumre.map((orgnummer) => ({
    orgnummer,
    status: "TILTAKSGRUPPE",
    toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  }));
