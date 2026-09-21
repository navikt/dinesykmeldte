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
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type TiltakspakkevurderingDeltakelse,
  TiltakspakkevurderingDeltakelseSchema,
  type Tiltakspakkevurderinger,
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
    error_code: diagnostics.error_code ?? errorCode,
    lookup_code: errorCode,
    upstream:
      errorCode === RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED
        ? "flaggskipet"
        : "dinesykmeldte-backend",
    outcome: "degraded",
  });
}

function getMockedTiltakspakkevurderinger(): Tiltakspakkevurderinger {
  const authorizedOrgnumre = extractAuthorizedOrgnumre(mockDb().sykmeldte);

  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
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
    return demoScenario === "tiltakspakke-1"
      ? getMockedTiltakspakkevurderinger()
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
  const deltakelseByOrgnummer = new Map<
    string,
    TiltakspakkevurderingDeltakelse
  >();
  let harTiltakspakkeIResponsen = false;

  for (const vurdering of flaggskipetResponse) {
    if (vurdering.tiltakspakkeId !== OPPFOLGINGSPLAN_TILTAKSPAKKE_1) {
      continue;
    }
    harTiltakspakkeIResponsen = true;

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

  if (!harTiltakspakkeIResponsen) {
    return [];
  }

  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: authorizedOrgnumre.flatMap((orgnummer) => {
        const deltakelse = deltakelseByOrgnummer.get(orgnummer);
        return deltakelse == null ? [] : [{ orgnummer, deltakelse }];
      }),
    },
  ];
}
