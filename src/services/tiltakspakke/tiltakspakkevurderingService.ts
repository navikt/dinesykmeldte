import { logger } from "@navikt/next-logger";
import type { PreviewSykmeldt } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { isPaaminnelseFeatureToggleEnabled } from "../../utils/env";
import { getMineSykmeldte } from "../minesykmeldte/mineSykmeldteService";
import {
  createEmptyTiltakspakkevurderingMap,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurdering,
  type TiltakspakkevurderingMap,
  TiltakspakkevurderingStatusSchema,
} from "./tiltakspakkevurderingContract";

/**
 * Råformat for en tiltakspakkevurdering slik Flaggskipet er forventet å svare.
 * Feltene er bevisst løse (nullable) fordi de valideres mot kontrakten i
 * mappingen før de slippes ut av BFF-en. Typen holdes privat her til #740
 * introduserer en egen Flaggskipet-adapter/evaluator.
 */
type RawTiltakspakkevurdering = {
  orgnummer?: string | null;
  status?: string | null;
  toggleId?: string | null;
};

/**
 * Midlertidig mock-evaluering som markerer alle autoriserte orgnumre som
 * TILTAKSGRUPPE. Byttes ut med den ekte Flaggskipet-integrasjonen i #740.
 */
async function evaluerOrgnumreMidlertidig(
  autoriserteOrgnumre: string[],
): Promise<RawTiltakspakkevurdering[]> {
  return autoriserteOrgnumre.map((orgnummer) => ({
    orgnummer,
    status: "TILTAKSGRUPPE",
    toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  }));
}

export async function getTiltakspakkevurderingMap(
  context: ResolverContextType,
): Promise<TiltakspakkevurderingMap> {
  if (!isPaaminnelseFeatureToggleEnabled()) {
    return createEmptyTiltakspakkevurderingMap();
  }

  // Konsument-BFF-en (dinesykmeldte) eier å finne og validere autoriserte
  // orgnumre i egen kontekst via MineSykmeldte. Evalueringen får kun de
  // ferdig autoriserte orgnumrene inn.
  let authorizedOrgnumre: string[];
  try {
    const mineSykmeldte = await getMineSykmeldte(context);
    authorizedOrgnumre = extractAuthorizedOrgnumre(mineSykmeldte);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "ORGNUMMER_OPPSLAG_FEILET",
      },
      "Failed to derive authorized orgnummer for tiltakspakkevurdering",
    );
    return createEmptyTiltakspakkevurderingMap();
  }

  if (authorizedOrgnumre.length === 0) {
    return createEmptyTiltakspakkevurderingMap();
  }

  try {
    const evaluations = await evaluerOrgnumreMidlertidig(authorizedOrgnumre);
    return mapRawEvaluationsToVurderingMap(authorizedOrgnumre, evaluations);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKE_EVALUERING_FEILET",
      },
      "Failed to evaluate tiltakspakkevurdering",
    );
    return createEmptyTiltakspakkevurderingMap();
  }
}

export function extractAuthorizedOrgnumre(
  mineSykmeldte: ReadonlyArray<Pick<PreviewSykmeldt, "orgnummer">>,
): string[] {
  const authorizedOrgnumre = new Set<string>();

  for (const { orgnummer } of mineSykmeldte) {
    if (orgnummer.length > 0) {
      authorizedOrgnumre.add(orgnummer);
    }
  }

  return Array.from(authorizedOrgnumre);
}

export function mapRawEvaluationsToVurderingMap(
  authorizedOrgnumre: string[],
  evaluations: ReadonlyArray<RawTiltakspakkevurdering>,
): TiltakspakkevurderingMap {
  const authorizedOrgnumreSet = new Set(authorizedOrgnumre);
  const vurderingerByOrgnummer = new Map<string, Tiltakspakkevurdering>();

  for (const evaluation of evaluations) {
    const orgnummer = evaluation.orgnummer;
    if (
      orgnummer == null ||
      orgnummer.length === 0 ||
      !authorizedOrgnumreSet.has(orgnummer) ||
      vurderingerByOrgnummer.has(orgnummer) ||
      evaluation.toggleId !== OPPFOLGINGSPLAN_TILTAKSPAKKE_1
    ) {
      continue;
    }

    const parsedStatus = TiltakspakkevurderingStatusSchema.safeParse(
      evaluation.status,
    );
    if (!parsedStatus.success) {
      continue;
    }

    vurderingerByOrgnummer.set(orgnummer, {
      orgnummer,
      status: parsedStatus.data,
      toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
    });
  }

  return {
    vurderinger: authorizedOrgnumre.flatMap((orgnummer) => {
      const vurdering = vurderingerByOrgnummer.get(orgnummer);
      return vurdering == null ? [] : [vurdering];
    }),
  };
}
