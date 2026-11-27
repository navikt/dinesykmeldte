import { describe, expect, it } from "vitest";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  type Tiltakspakkevurderinger,
} from "./tiltakspakkevurderingContract";
import {
  getTildelingsgruppe,
  isTiltaksgruppeForAnyOrgnummer,
} from "./tiltakspakkevurderingGating";

const ORGNUMMER = "999888777";
const ANNET_ORGNUMMER = "111222333";

describe("getTildelingsgruppe", () => {
  const vurderinger: Tiltakspakkevurderinger = [
    {
      tiltakspakkeId: DIALOGMOTE_TILTAKSPAKKE_2,
      virksomheter: [
        { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];
  const pakke = DIALOGMOTE_TILTAKSPAKKE_2;

  it("does not collapse mixed or incomplete assignment into treatment", () => {
    expect(getTildelingsgruppe(pakke, vurderinger, [ORGNUMMER])).toBe("tiltak");
    expect(getTildelingsgruppe(pakke, vurderinger, [ANNET_ORGNUMMER])).toBe(
      "kontroll",
    );
    expect(
      getTildelingsgruppe(pakke, vurderinger, [ORGNUMMER, ANNET_ORGNUMMER]),
    ).toBe("blandet");
    expect(
      getTildelingsgruppe(pakke, vurderinger, [ORGNUMMER, "missing"]),
    ).toBe("ukjent");
    expect(getTildelingsgruppe(pakke, vurderinger, [])).toBe("ukjent");
    expect(getTildelingsgruppe(pakke, [], [ORGNUMMER])).toBe("ukjent");
    expect(getTildelingsgruppe(pakke, undefined, [ORGNUMMER])).toBe("ukjent");
  });
});

describe("isTiltaksgruppeForAnyOrgnummer", () => {
  const pakke = DIALOGMOTE_TILTAKSPAKKE_2;
  const blandetVurdering: Tiltakspakkevurderinger = [
    {
      tiltakspakkeId: pakke,
      virksomheter: [
        { orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
        { orgnummer: ANNET_ORGNUMMER, deltakelse: "KONTROLLGRUPPE" },
      ],
    },
  ];

  it("er true når minst én virksomhet er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForAnyOrgnummer(pakke, blandetVurdering, [
        ANNET_ORGNUMMER,
        ORGNUMMER,
      ]),
    ).toBe(true);
  });

  it("er false når ingen av virksomhetene er i tiltaksgruppen", () => {
    expect(
      isTiltaksgruppeForAnyOrgnummer(pakke, blandetVurdering, [
        ANNET_ORGNUMMER,
        "000000000",
      ]),
    ).toBe(false);
  });

  it("er false når tiltaksgruppen bare gjelder et annet orgnummer", () => {
    expect(
      isTiltaksgruppeForAnyOrgnummer(pakke, blandetVurdering, [
        ANNET_ORGNUMMER,
      ]),
    ).toBe(false);
  });

  it.each(["KONTROLLGRUPPE", "UTENFOR_SCOPE"] as const)(
    "er false for %s",
    (deltakelse) => {
      expect(
        isTiltaksgruppeForAnyOrgnummer(
          pakke,
          [
            {
              tiltakspakkeId: pakke,
              virksomheter: [{ orgnummer: ORGNUMMER, deltakelse }],
            },
          ],
          [ORGNUMMER],
        ),
      ).toBe(false);
    },
  );

  it("er false for tom orgnummerkontekst", () => {
    expect(isTiltaksgruppeForAnyOrgnummer(pakke, blandetVurdering, [])).toBe(
      false,
    );
  });

  it("er false for tom vurdering", () => {
    expect(
      isTiltaksgruppeForAnyOrgnummer(pakke, [], [ORGNUMMER, ANNET_ORGNUMMER]),
    ).toBe(false);
  });
});
