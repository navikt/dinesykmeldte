import { describe, expect, it } from "vitest";
import { createAktivitetIkkeMuligPeriode } from "../../utils/test/dataCreators";
import {
  backfillSynligFra,
  finnTidligsteFom,
  isTiltaksgruppeForOrgnummer,
  type ModulState,
  toModulState,
} from "./paaminnelseModulState";

const ORGNUMMER = "999888777";

describe("toModulState", () => {
  it("gir HIDDEN når status er SKJULT", () => {
    expect(
      toModulState({ status: "SKJULT", synligFra: null }, "2026-06-01"),
    ).toEqual({ status: "HIDDEN" });
  });

  it("gir HIDDEN når synligFra mangler", () => {
    expect(
      toModulState({ status: "TILGJENGELIG", synligFra: null }, "2026-06-01"),
    ).toEqual({ status: "HIDDEN" });
  });

  it("gir HIDDEN når sykmeldingen starter før synligFra", () => {
    expect(
      toModulState(
        { status: "TILGJENGELIG", synligFra: "2026-07-01" },
        "2026-06-01",
      ),
    ).toEqual({ status: "HIDDEN" });
  });

  it("gir HIDDEN når sykmeldingen mangler perioder", () => {
    expect(
      toModulState({ status: "TILGJENGELIG", synligFra: "2026-05-01" }, null),
    ).toEqual({ status: "HIDDEN" });
  });

  it("gir VISIBLE med status og synligFra når vinduet er åpent", () => {
    expect(
      toModulState(
        { status: "BESTILT", synligFra: "2026-05-01" },
        "2026-06-01",
      ),
    ).toEqual({
      status: "VISIBLE",
      paaminnelseStatus: "BESTILT",
      synligFra: "2026-05-01",
    });
  });
});

describe("backfillSynligFra", () => {
  const visible: ModulState = {
    status: "VISIBLE",
    paaminnelseStatus: "TILGJENGELIG",
    synligFra: "2026-05-01",
  };

  it("beholder synligFra fra forrige VISIBLE når skrivesvar mangler den", () => {
    expect(
      backfillSynligFra({ status: "BESTILT", synligFra: null }, visible),
    ).toEqual({ status: "BESTILT", synligFra: "2026-05-01" });
  });

  it("bruker ekte synligFra fra skrivesvar når den finnes", () => {
    expect(
      backfillSynligFra(
        { status: "BESTILT", synligFra: "2026-06-15" },
        visible,
      ),
    ).toEqual({ status: "BESTILT", synligFra: "2026-06-15" });
  });

  it("lar SKJULT stå urørt (fail-safe)", () => {
    expect(
      backfillSynligFra({ status: "SKJULT", synligFra: null }, visible),
    ).toEqual({ status: "SKJULT", synligFra: null });
  });

  it("backfiller ikke når forrige tilstand ikke er VISIBLE", () => {
    expect(
      backfillSynligFra(
        { status: "BESTILT", synligFra: null },
        {
          status: "LOADING",
        },
      ),
    ).toEqual({ status: "BESTILT", synligFra: null });
  });
});

describe("isTiltaksgruppeForOrgnummer", () => {
  it("er true kun for TILTAKSGRUPPE på riktig orgnummer og tiltakspakke", () => {
    expect(
      isTiltaksgruppeForOrgnummer(
        [
          {
            tiltakspakkeId: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
            virksomheter: [
              { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
            ],
          },
        ],
        ORGNUMMER,
      ),
    ).toBe(true);
  });

  it.each([
    "KONTROLLGRUPPE",
    "UTENFOR_SCOPE",
  ] as const)("er false for %s", (deltakelse) => {
    expect(
      isTiltaksgruppeForOrgnummer(
        [
          {
            tiltakspakkeId: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
            virksomheter: [{ orgnummer: ORGNUMMER, deltakelse }],
          },
        ],
        ORGNUMMER,
      ),
    ).toBe(false);
  });

  it("er false når TILTAKSGRUPPE gjelder et annet orgnummer", () => {
    expect(
      isTiltaksgruppeForOrgnummer(
        [
          {
            tiltakspakkeId: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
            virksomheter: [
              { orgnummer: "000000000", deltakelse: "TILTAKSGRUPPE" },
            ],
          },
        ],
        ORGNUMMER,
      ),
    ).toBe(false);
  });

  it("er false for tom vurdering", () => {
    expect(isTiltaksgruppeForOrgnummer([], ORGNUMMER)).toBe(false);
  });
});

describe("finnTidligsteFom", () => {
  it("returnerer den tidligste fom-en på tvers av perioder", () => {
    expect(
      finnTidligsteFom([
        createAktivitetIkkeMuligPeriode({ fom: "2026-06-10" }),
        createAktivitetIkkeMuligPeriode({ fom: "2026-05-01" }),
      ]),
    ).toBe("2026-05-01");
  });

  it("returnerer null når det ikke finnes perioder", () => {
    expect(finnTidligsteFom([])).toBeNull();
  });
});
