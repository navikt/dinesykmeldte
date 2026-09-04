import { logger } from "@navikt/next-logger";
import mockDb from "../../graphql/resolvers/mockresolvers/mockDb";
import type { PreviewSykmeldt } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  RuntimeErrorCode,
  RuntimeErrorEvent,
  runtimeErrorContext,
} from "../../observability/runtimeErrorContract";
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

const RUNTIME_ERROR_MESSAGE =
  "Kunne ikke hente tiltakspakkevurdering; returnerer tom liste";

function logLookupFailure(
  errorCode:
    | typeof RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED
    | typeof RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED,
): void {
  logger.error(
    runtimeErrorContext(
      RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED,
      errorCode,
    ),
    RUNTIME_ERROR_MESSAGE,
  );
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

export async function getTiltakspakkevurderinger(
  context: ResolverContextType,
): Promise<Tiltakspakkevurderinger> {
  if (isLocalOrDemo) {
    return getMockedTiltakspakkevurderinger();
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
  } catch {
    logLookupFailure(RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED);
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
  } catch {
    logLookupFailure(RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED);
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
