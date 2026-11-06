import mockDb from "../../graphql/resolvers/mockresolvers/mockDb";
import type { PreviewSykmeldt } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { RuntimeErrorCode } from "../../observability/runtimeErrorContract";
import {
  failureDiagnostics,
  logServerFailure,
} from "../../observability/serverLog";
import {
  DEFAULT_DEMO_SCENARIO,
  type DemoScenario,
} from "../../utils/demoScenario";
import {
  isLocalOrDemo,
  isTiltakspakkevurderingFeatureToggleEnabled,
} from "../../utils/env";
import { fetchTiltakspakkevurderinger as fetchFraFlaggskipet } from "../flaggskipet/flaggskipetClient";
import type { FlaggskipetTiltakspakkevurderinger } from "../flaggskipet/flaggskipetContract";
import { getMineSykmeldte } from "../minesykmeldte/mineSykmeldteService";
import {
  createEmptyTiltakspakkevurderinger,
  DIALOGMOTE_TILTAKSPAKKE_2,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type TiltakspakkevurderingDeltakelse,
  TiltakspakkevurderingDeltakelseSchema,
  type Tiltakspakkevurderinger,
  type TiltakspakkevurderingTiltakspakkeId,
  TiltakspakkevurderingTiltakspakkeIdSchema,
} from "./tiltakspakkevurderingContract";

function logLookupFailure(
  error: unknown,
  errorCode:
    | typeof RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED
    | typeof RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED,
): void {
  const diagnostics = failureDiagnostics(error);
  logServerFailure("tiltakspakkeLookupFailed", error, {
    ...diagnostics,
    cause_code: diagnostics.error_code,
    error_code: errorCode,
    upstream:
      errorCode === RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED
        ? "flaggskipet"
        : "dinesykmeldte-backend",
    outcome: "degraded",
  });
}

const DEMO_SCENARIO_TILTAKSPAKKE: Partial<
  Record<DemoScenario, TiltakspakkevurderingTiltakspakkeId>
> = {
  "tiltakspakke-1": OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  "tiltakspakke-2": DIALOGMOTE_TILTAKSPAKKE_2,
};

function getMockedTiltakspakkevurderinger(
  tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId,
): Tiltakspakkevurderinger {
  const authorizedOrgnumre = extractAuthorizedOrgnumre(mockDb().sykmeldte);

  return [
    {
      tiltakspakkeId,
      virksomheter: authorizedOrgnumre.map((orgnummer) => ({
        orgnummer,
        deltakelse: "TILTAKSGRUPPE",
      })),
    },
  ];
}

export interface GetTiltakspakkevurderingerOptions {
  demoScenario?: DemoScenario;
}

export async function getTiltakspakkevurderinger(
  context: ResolverContextType,
  {
    demoScenario = DEFAULT_DEMO_SCENARIO,
  }: GetTiltakspakkevurderingerOptions = {},
): Promise<Tiltakspakkevurderinger> {
  if (isLocalOrDemo) {
    const demoTiltakspakke = DEMO_SCENARIO_TILTAKSPAKKE[demoScenario];
    return demoTiltakspakke
      ? getMockedTiltakspakkevurderinger(demoTiltakspakke)
      : createEmptyTiltakspakkevurderinger();
  }

  const featureToggleEnabled = isTiltakspakkevurderingFeatureToggleEnabled();

  // Konsument-BFF-en (dinesykmeldte) eier å finne og validere autoriserte
  // orgnumre i egen kontekst via MineSykmeldte, og Flaggskipet-kallet får kun
  // de ferdig autoriserte orgnumrene inn.
  let authorizedOrgnumre: string[];
  try {
    authorizedOrgnumre = extractAuthorizedOrgnumre(
      await getMineSykmeldte(context),
    );
  } catch (error) {
    logLookupFailure(
      error,
      RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED,
    );
    return createEmptyTiltakspakkevurderinger();
  }

  if (authorizedOrgnumre.length === 0) {
    return createEmptyTiltakspakkevurderinger();
  }

  let flaggskipetResponse: FlaggskipetTiltakspakkevurderinger;
  try {
    flaggskipetResponse = await fetchFraFlaggskipet(
      authorizedOrgnumre,
      context.accessToken,
    );
  } catch (error) {
    logLookupFailure(error, RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED);
    return createEmptyTiltakspakkevurderinger();
  }

  if (!featureToggleEnabled) {
    return createEmptyTiltakspakkevurderinger();
  }

  return mapFlaggskipetResponseToVurderinger(
    authorizedOrgnumre,
    flaggskipetResponse,
  );
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

export function mapFlaggskipetResponseToVurderinger(
  authorizedOrgnumre: string[],
  flaggskipetResponse: FlaggskipetTiltakspakkevurderinger,
): Tiltakspakkevurderinger {
  const authorizedOrgnumreSet = new Set(authorizedOrgnumre);
  const deltakelseByPakke = new Map<
    TiltakspakkevurderingTiltakspakkeId,
    Map<string, TiltakspakkevurderingDeltakelse>
  >();

  for (const vurdering of flaggskipetResponse) {
    const parsedTiltakspakkeId =
      TiltakspakkevurderingTiltakspakkeIdSchema.safeParse(
        vurdering.tiltakspakkeId,
      );
    if (!parsedTiltakspakkeId.success) {
      continue;
    }
    let deltakelseByOrgnummer = deltakelseByPakke.get(
      parsedTiltakspakkeId.data,
    );
    if (deltakelseByOrgnummer == null) {
      deltakelseByOrgnummer = new Map();
      deltakelseByPakke.set(parsedTiltakspakkeId.data, deltakelseByOrgnummer);
    }

    for (const virksomhet of vurdering.virksomheter ?? []) {
      const orgnummer = virksomhet?.orgnummer;
      if (
        orgnummer == null ||
        orgnummer.length === 0 ||
        !authorizedOrgnumreSet.has(orgnummer) ||
        deltakelseByOrgnummer.has(orgnummer)
      ) {
        continue;
      }

      const parsedDeltakelse = TiltakspakkevurderingDeltakelseSchema.safeParse(
        virksomhet?.deltakelse,
      );
      if (!parsedDeltakelse.success) {
        continue;
      }

      deltakelseByOrgnummer.set(orgnummer, parsedDeltakelse.data);
    }
  }

  // Fast rekkefølge etter kontrakten, uavhengig av rekkefølgen i responsen.
  return TiltakspakkevurderingTiltakspakkeIdSchema.options.flatMap(
    (tiltakspakkeId) => {
      const deltakelseByOrgnummer = deltakelseByPakke.get(tiltakspakkeId);
      if (deltakelseByOrgnummer == null) return [];
      return [
        {
          tiltakspakkeId,
          virksomheter: authorizedOrgnumre.flatMap((orgnummer) => {
            const deltakelse = deltakelseByOrgnummer.get(orgnummer);
            return deltakelse == null ? [] : [{ orgnummer, deltakelse }];
          }),
        },
      ];
    },
  );
}
