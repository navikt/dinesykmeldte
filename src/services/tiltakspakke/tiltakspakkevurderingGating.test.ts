import { describe, expect, it } from "vitest";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";
import {
  getTildelingsgruppe,
  isTiltaksgruppeForMinstEttOrgnummer,
  isTiltaksgruppeForOrgnummer,
} from "./tiltakspakkevurderingGating";

const ORGNUMMER = "999888777";
const ANNET_ORGNUMMER = "111222333";

/** Pakkene trekkes uavhengig: samme virksomhet har motsatt gruppe i de to. */
const toPakker: Tiltakspakkevurderinger = [
  {
    tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
    virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" }],
  },
  {
    tiltakspakkeId: DIALOGMOTE_TILTAKSPAKKE_2,
    virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "KONTROLLGRUPPE" }],
  },
];

describe("getTildelingsgruppe", () => {
  const vurderinger: Tiltakspakkevurderinger = [
    {
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [
        { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];
  const pakke1 = OPPFOLGINGSPLAN_TILTAKSPAKKE_1;

  it("does not collapse mixed or incomplete assignment into treatment", () => {
    expect(getTildelingsgruppe(pakke1, vurderinger, [ORGNUMMER])).toBe(
      "tiltak",
    );
    expect(getTildelingsgruppe(pakke1, vurderinger, [ANNET_ORGNUMMER])).toBe(
      "kontroll",
    );
    expect(
      getTildelingsgruppe(pakke1, vurderinger, [ORGNUMMER, ANNET_ORGNUMMER]),
    ).toBe("blandet");
    expect(
      getTildelingsgruppe(pakke1, vurderinger, [ORGNUMMER, "missing"]),
    ).toBe("ukjent");
    expect(getTildelingsgruppe(pakke1, vurderinger, [])).toBe("ukjent");
    expect(getTildelingsgruppe(pakke1, [], [ORGNUMMER])).toBe("ukjent");
    expect(getTildelingsgruppe(pakke1, undefined, [ORGNUMMER])).toBe("ukjent");
  });

  it("leser kun gruppen for den etterspurte tiltakspakken", () => {
    expect(getTildelingsgruppe(pakke1, toPakker, [ORGNUMMER])).toBe("tiltak");
    expect(
      getTildelingsgruppe(DIALOGMOTE_TILTAKSPAKKE_2, toPakker, [ORGNUMMER]),
    ).toBe("kontroll");
  });

  it("er ukjent når den etterspurte tiltakspakken mangler i vurderingen", () => {
    expect(
      getTildelingsgruppe(DIALOGMOTE_TILTAKSPAKKE_2, vurderinger, [ORGNUMMER]),
    ).toBe("ukjent");
  });
});

describe("isTiltaksgruppeForOrgnummer", () => {
  const pakke1 = OPPFOLGINGSPLAN_TILTAKSPAKKE_1;

  it("er true kun for TILTAKSGRUPPE på riktig orgnummer og tiltakspakke", () => {
    expect(
      isTiltaksgruppeForOrgnummer(
        pakke1,
        [
          {
            tiltakspakkeId: pakke1,
            virksomheter: [
              { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
            ],
          },
        ],
        ORGNUMMER,
      ),
    ).toBe(true);
  });

  it.each(["KONTROLLGRUPPE", "UTENFOR_SCOPE"] as const)(
    "er false for %s",
    (deltakelse) => {
      expect(
        isTiltaksgruppeForOrgnummer(
          pakke1,
          [
            {
              tiltakspakkeId: pakke1,
              virksomheter: [{ orgnummer: ORGNUMMER, deltakelse }],
            },
          ],
          ORGNUMMER,
        ),
      ).toBe(false);
    },
  );

  it("er false når TILTAKSGRUPPE gjelder et annet orgnummer", () => {
    expect(
      isTiltaksgruppeForOrgnummer(
        pakke1,
        [
          {
            tiltakspakkeId: pakke1,
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
    expect(isTiltaksgruppeForOrgnummer(pakke1, [], ORGNUMMER)).toBe(false);
  });

  it("lar ikke tiltaksgruppen i én tiltakspakke åpne en annen", () => {
    expect(isTiltaksgruppeForOrgnummer(pakke1, toPakker, ORGNUMMER)).toBe(true);
    expect(
      isTiltaksgruppeForOrgnummer(
        DIALOGMOTE_TILTAKSPAKKE_2,
        toPakker,
        ORGNUMMER,
      ),
    ).toBe(false);
  });
});

describe("isTiltaksgruppeForMinstEttOrgnummer", () => {
  const pakke1 = OPPFOLGINGSPLAN_TILTAKSPAKKE_1;
  const blandetVurdering: Tiltakspakkevurderinger = [
    {
      tiltakspakkeId: pakke1,
      virksomheter: [
        { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];

  it("er true når minst én virksomhet er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(pakke1, blandetVurdering, [
        ANNET_ORGNUMMER,
        ORGNUMMER,
      ]),
    ).toBe(true);
  });

  it("er false når ingen av virksomhetene er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(pakke1, blandetVurdering, [
        ANNET_ORGNUMMER,
        "000000000",
      ]),
    ).toBe(false);
  });

  it("er identisk med enkeltvurderingen når konteksten er ett orgnummer", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(pakke1, blandetVurdering, [
        ORGNUMMER,
      ]),
    ).toBe(isTiltaksgruppeForOrgnummer(pakke1, blandetVurdering, ORGNUMMER));
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(pakke1, blandetVurdering, [
        ANNET_ORGNUMMER,
      ]),
    ).toBe(
      isTiltaksgruppeForOrgnummer(pakke1, blandetVurdering, ANNET_ORGNUMMER),
    );
  });

  it("er false for tom orgnummerkontekst", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(pakke1, blandetVurdering, []),
    ).toBe(false);
  });

  it("er false for tom vurdering", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(
        pakke1,
        [],
        [ORGNUMMER, ANNET_ORGNUMMER],
      ),
    ).toBe(false);
  });

  it("er false når bare en annen tiltakspakke har tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForMinstEttOrgnummer(DIALOGMOTE_TILTAKSPAKKE_2, toPakker, [
        ORGNUMMER,
      ]),
    ).toBe(false);
  });
});
