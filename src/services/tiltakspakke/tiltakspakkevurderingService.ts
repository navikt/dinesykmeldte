import { logger } from "@navikt/next-logger";
import mockDb from "../../graphql/resolvers/mockresolvers/mockDb";
import type { PreviewSykmeldt } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  isLocalOrDemo,
  isTiltakspakkevurderingFeatureToggleEnabled,
} from "../../utils/env";
import { getMineSykmeldte } from "../minesykmeldte/mineSykmeldteService";
import {
  createEmptyTiltakspakkevurderinger,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type TiltakspakkeVirksomhet,
  TiltakspakkevurderingDeltakelseSchema,
  type Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";

/**
 * Råformat for en tiltakspakkevurdering slik Flaggskipet er forventet å svare.
 * Responsen er gruppert per tiltakspakke med en liste virksomheter, og feltene
 * er bevisst løse (nullable) fordi de valideres mot kontrakten i mappingen før
 * de slippes ut av BFF-en. Typen holdes privat her til #740 introduserer en
 * egen Flaggskipet-adapter/evaluator.
 */
type RawTiltakspakkeVirksomhet = {
  orgnummer?: string | null;
  deltakelse?: string | null;
};

type RawTiltakspakkevurdering = {
  tiltakspakkeId?: string | null;
  virksomheter?: ReadonlyArray<RawTiltakspakkeVirksomhet | null> | null;
};

/**
 * Midlertidig mock-evaluering som markerer alle autoriserte orgnumre som
 * TILTAKSGRUPPE i én tiltakspakke. Byttes ut med den ekte
 * Flaggskipet-integrasjonen i #740.
 */
async function evaluerOrgnumreMidlertidig(
  autoriserteOrgnumre: string[],
): Promise<RawTiltakspakkevurdering[]> {
  return [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: autoriserteOrgnumre.map((orgnummer) => ({
        orgnummer,
        deltakelse: "TILTAKSGRUPPE",
      })),
    },
  ];
}

/**
 * Midlertidig lokal kilde for autoriserte orgnumre. Lokalt og i demo finnes det
 * ingen ekte MineSykmeldte/TokenX, så orgnumrene hentes fra det samme
 * GraphQL-mock-datasettet som resten av appen bruker. Avgrenset til dette ene
 * punktet med vilje; byttes ut når #740/#732 gir en ekte kilde.
 */
function hentLokaleAutoriserteOrgnumre(): string[] {
  return extractAuthorizedOrgnumre(mockDb().sykmeldte);
}

export async function getTiltakspakkevurderinger(
  context: ResolverContextType,
): Promise<Tiltakspakkevurderinger> {
  if (!isTiltakspakkevurderingFeatureToggleEnabled()) {
    return createEmptyTiltakspakkevurderinger();
  }

  // Konsument-BFF-en (dinesykmeldte) eier å finne og validere autoriserte
  // orgnumre i egen kontekst via MineSykmeldte. Evalueringen får kun de
  // ferdig autoriserte orgnumrene inn. Lokalt/demo finnes ikke ekte
  // MineSykmeldte, så da brukes mock-datasettet som kilde.
  let authorizedOrgnumre: string[];
  try {
    authorizedOrgnumre = isLocalOrDemo
      ? hentLokaleAutoriserteOrgnumre()
      : extractAuthorizedOrgnumre(await getMineSykmeldte(context));
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "ORGNUMMER_OPPSLAG_FEILET",
      },
      "Failed to derive authorized orgnummer for tiltakspakkevurdering",
    );
    return createEmptyTiltakspakkevurderinger();
  }

  if (authorizedOrgnumre.length === 0) {
    return createEmptyTiltakspakkevurderinger();
  }

  try {
    const evaluations = await evaluerOrgnumreMidlertidig(authorizedOrgnumre);
    return mapRawEvaluationsToVurderinger(authorizedOrgnumre, evaluations);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKE_EVALUERING_FEILET",
      },
      "Failed to evaluate tiltakspakkevurdering",
    );
    return createEmptyTiltakspakkevurderinger();
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

export function mapRawEvaluationsToVurderinger(
  authorizedOrgnumre: string[],
  evaluations: ReadonlyArray<RawTiltakspakkevurdering>,
): Tiltakspakkevurderinger {
  const authorizedOrgnumreSet = new Set(authorizedOrgnumre);
  const virksomheterByTiltakspakkeId = new Map<
    string,
    Map<string, TiltakspakkeVirksomhet>
  >();
  const tiltakspakkeIdOrder: string[] = [];

  for (const evaluation of evaluations) {
    if (evaluation.tiltakspakkeId !== OPPFOLGINGSPLAN_TILTAKSPAKKE_1) {
      continue;
    }

    let virksomheterByOrgnummer = virksomheterByTiltakspakkeId.get(
      evaluation.tiltakspakkeId,
    );
    if (virksomheterByOrgnummer == null) {
      virksomheterByOrgnummer = new Map<string, TiltakspakkeVirksomhet>();
      virksomheterByTiltakspakkeId.set(
        evaluation.tiltakspakkeId,
        virksomheterByOrgnummer,
      );
      tiltakspakkeIdOrder.push(evaluation.tiltakspakkeId);
    }

    for (const virksomhet of evaluation.virksomheter ?? []) {
      const orgnummer = virksomhet?.orgnummer;
      if (
        orgnummer == null ||
        orgnummer.length === 0 ||
        !authorizedOrgnumreSet.has(orgnummer) ||
        virksomheterByOrgnummer.has(orgnummer)
      ) {
        continue;
      }

      const parsedDeltakelse = TiltakspakkevurderingDeltakelseSchema.safeParse(
        virksomhet?.deltakelse,
      );
      if (!parsedDeltakelse.success) {
        continue;
      }

      virksomheterByOrgnummer.set(orgnummer, {
        orgnummer,
        deltakelse: parsedDeltakelse.data,
      });
    }
  }

  return tiltakspakkeIdOrder.flatMap((tiltakspakkeId) => {
    if (tiltakspakkeId !== OPPFOLGINGSPLAN_TILTAKSPAKKE_1) {
      return [];
    }

    const virksomheterByOrgnummer =
      virksomheterByTiltakspakkeId.get(tiltakspakkeId);

    return [
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: authorizedOrgnumre.flatMap((orgnummer) => {
          const virksomhet = virksomheterByOrgnummer?.get(orgnummer);
          return virksomhet == null ? [] : [virksomhet];
        }),
      },
    ];
  });
}
