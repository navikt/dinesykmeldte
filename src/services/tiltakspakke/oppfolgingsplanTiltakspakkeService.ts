import { logger } from "@navikt/next-logger";
import type { PreviewSykmeldt } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { isPaaminnelseFeatureToggleEnabled } from "../../utils/env";
import { getMineSykmeldte as getMineSykmeldteFromBackend } from "../minesykmeldte/mineSykmeldteService";
import {
  createEmptyOppfolgingsplanTiltakspakkeGateMap,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type OppfolgingsplanTiltakspakkeGate,
  type OppfolgingsplanTiltakspakkeGateMap,
  OppfolgingsplanTiltakspakkeStatusSchema,
} from "./oppfolgingsplanTiltakspakkeContract";

export type RawOppfolgingsplanTiltakspakkeEvaluation = {
  orgnummer?: string | null;
  status?: string | null;
  toggleId?: string | null;
};

type GetMineSykmeldte = typeof getMineSykmeldteFromBackend;
type EvaluateOrgnumre = (
  authorizedOrgnumre: string[],
) => Promise<RawOppfolgingsplanTiltakspakkeEvaluation[]>;

type Dependencies = {
  getMineSykmeldte?: GetMineSykmeldte;
  evaluateOrgnumre?: EvaluateOrgnumre;
  isFeatureEnabled?: () => boolean;
};

export async function getOppfolgingsplanTiltakspakkeGateMap(
  context: ResolverContextType,
  dependencies: Dependencies = {},
): Promise<OppfolgingsplanTiltakspakkeGateMap> {
  const isFeatureEnabled =
    dependencies.isFeatureEnabled ?? isPaaminnelseFeatureToggleEnabled;
  if (!isFeatureEnabled()) {
    return createEmptyOppfolgingsplanTiltakspakkeGateMap();
  }

  const getMineSykmeldte =
    dependencies.getMineSykmeldte ?? getMineSykmeldteFromBackend;
  const evaluateOrgnumre =
    dependencies.evaluateOrgnumre ?? evaluateAuthorizedOrgnumreWithMock;

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
      "Failed to derive authorized orgnummer for tiltakspakke gating",
    );
    return createEmptyOppfolgingsplanTiltakspakkeGateMap();
  }

  if (authorizedOrgnumre.length === 0) {
    return createEmptyOppfolgingsplanTiltakspakkeGateMap();
  }

  try {
    const evaluations = await evaluateOrgnumre(authorizedOrgnumre);
    return mapRawEvaluationsToGateMap(authorizedOrgnumre, evaluations);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKE_EVALUERING_FEILET",
      },
      "Failed to evaluate tiltakspakke gating",
    );
    return createEmptyOppfolgingsplanTiltakspakkeGateMap();
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

export function mapRawEvaluationsToGateMap(
  authorizedOrgnumre: string[],
  evaluations: ReadonlyArray<RawOppfolgingsplanTiltakspakkeEvaluation>,
): OppfolgingsplanTiltakspakkeGateMap {
  const authorizedOrgnumreSet = new Set(authorizedOrgnumre);
  const gatesByOrgnummer = new Map<string, OppfolgingsplanTiltakspakkeGate>();

  for (const evaluation of evaluations) {
    const orgnummer = evaluation.orgnummer;
    if (
      orgnummer == null ||
      orgnummer.length === 0 ||
      !authorizedOrgnumreSet.has(orgnummer) ||
      gatesByOrgnummer.has(orgnummer) ||
      evaluation.toggleId !== OPPFOLGINGSPLAN_TILTAKSPAKKE_1
    ) {
      continue;
    }

    const parsedStatus = OppfolgingsplanTiltakspakkeStatusSchema.safeParse(
      evaluation.status,
    );
    if (!parsedStatus.success) {
      continue;
    }

    gatesByOrgnummer.set(orgnummer, {
      orgnummer,
      status: parsedStatus.data,
      toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
    });
  }

  return {
    gates: authorizedOrgnumre.flatMap((orgnummer) => {
      const gate = gatesByOrgnummer.get(orgnummer);
      return gate == null ? [] : [gate];
    }),
  };
}

async function evaluateAuthorizedOrgnumreWithMock(
  authorizedOrgnumre: string[],
): Promise<RawOppfolgingsplanTiltakspakkeEvaluation[]> {
  return authorizedOrgnumre.map((orgnummer) => ({
    orgnummer,
    status: "TILTAKSGRUPPE",
    toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  }));
}
