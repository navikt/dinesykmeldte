import { describe, expect, it } from "vitest";
import type { Tiltakspakkevurderinger } from "./tiltakspakkevurderingContract";
import {
  isTiltaksgruppeForMinstEttOrgnummer,
  isTiltaksgruppeForOrgnummer,
} from "./tiltakspakkevurderingGating";

const ORGNUMMER = "999888777";
const ANNET_ORGNUMMER = "111222333";

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

describe("isTiltaksgruppeForMinstEttOrgnummer", () => {
  const blandetVurdering: Tiltakspakkevurderinger = [
    {
      tiltakspakkeId: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
      virksomheter: [
        { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];

  it("er true når minst én virksomhet er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(blandetVurdering, [
        ANNET_ORGNUMMER,
        ORGNUMMER,
      ]),
    ).toBe(true);
  });

  it("er false når ingen av virksomhetene er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(blandetVurdering, [
        ANNET_ORGNUMMER,
        "000000000",
      ]),
    ).toBe(false);
  });

  it("er identisk med enkeltvurderingen når konteksten er ett orgnummer", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(blandetVurdering, [ORGNUMMER]),
    ).toBe(isTiltaksgruppeForOrgnummer(blandetVurdering, ORGNUMMER));
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(blandetVurdering, [ANNET_ORGNUMMER]),
    ).toBe(isTiltaksgruppeForOrgnummer(blandetVurdering, ANNET_ORGNUMMER));
  });

  it("er false for tom orgnummerkontekst", () => {
    expect(isTiltaksgruppeForMinstEttOrgnummer(blandetVurdering, [])).toBe(
      false,
    );
  });

  it("er false for tom vurdering", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer([], [ORGNUMMER, ANNET_ORGNUMMER]),
    ).toBe(false);
  });
});
