import { describe, expect, it } from "vitest";
import { isTiltaksgruppeForOrgnummer } from "./paaminnelseUtils";

const ORGNUMMER = "999888777";

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
