import { describe, expect, it } from "vitest";
import {
  formatNamePossessive,
  hasBeenSykmeldt6WeeksWithout16DaysOpphold,
  notificationCount,
} from "./sykmeldtUtils";
import {
  createAktivitetIkkeMuligPeriode,
  createDialogmote,
  createOppfolgingsplan,
  createPreviewFremtidigSoknad,
  createPreviewNySoknad,
  createPreviewSendtSoknad,
  createPreviewSykmeldt,
  createSykmelding,
} from "./test/dataCreators";

describe("notificationCount", () => {
  it("counts unread sykmeldinger, notifying søknader, dialogmøter and oppfølgingsplaner", () => {
    const sykmeldt = createPreviewSykmeldt({
      sykmeldinger: [
        createSykmelding({ lest: false }),
        createSykmelding({ lest: true }),
      ],
      previewSoknader: [
        createPreviewSendtSoknad({ lest: false }),
        createPreviewSendtSoknad({ lest: true }),
        createPreviewNySoknad({ ikkeSendtSoknadVarsel: true }),
        createPreviewNySoknad({ ikkeSendtSoknadVarsel: false }),
        createPreviewFremtidigSoknad(),
      ],
      dialogmoter: [createDialogmote()],
      oppfolgingsplaner: [createOppfolgingsplan()],
    });

    expect(notificationCount(sykmeldt)).toBe(5);
  });

  it("does not notify when the remaining types have nothing unread or pending", () => {
    expect(
      notificationCount(
        createPreviewSykmeldt({
          sykmeldinger: [createSykmelding({ lest: true })],
          previewSoknader: [
            createPreviewSendtSoknad({ lest: true }),
            createPreviewNySoknad({ ikkeSendtSoknadVarsel: false }),
            createPreviewFremtidigSoknad(),
          ],
        }),
      ),
    ).toBe(0);
  });
});

describe("formatNamePossessive", () => {
  it("should format correct when ending with an S", () => {
    expect(formatNamePossessive("Nils", "eplekake")).toEqual("Nils' eplekake");
  });

  it("should format correct when ending with an X", () => {
    expect(formatNamePossessive("Marx", "bokhylle")).toEqual("Marx' bokhylle");
  });

  it("should format correct when ends is neither S or X", () => {
    expect(formatNamePossessive("Mika", "bokhylle")).toEqual("Mikas bokhylle");
  });

  it("should provide fallback value when null", () => {
    expect(formatNamePossessive(null, "bokhylle")).toEqual(
      "Sykmeldtes bokhylle",
    );
  });
});

describe("hasBeenSykmeldt6WeeksWithout16DaysOpphold", () => {
  it("should add days when days between period is 16 or less", () => {
    const sykmeldt = createPreviewSykmeldt({
      sykmeldinger: [
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              fom: "2021-01-01",
              tom: "2021-01-15",
            }),
          ],
        }),
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              // 16 days between this and previous tom
              fom: "2021-02-01",
              tom: "2021-02-28",
            }),
          ],
        }),
      ],
    });

    // 42 days in total = 6 weeks
    expect(hasBeenSykmeldt6WeeksWithout16DaysOpphold(sykmeldt)).toBe(true);
  });

  it("should add days when days between period is 16 or less with multiple periods and sykmeldinger", () => {
    const sykmeldt = createPreviewSykmeldt({
      sykmeldinger: [
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              fom: "2021-01-01",
              tom: "2021-01-15",
            }),
          ],
        }),
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              // 16 days between this and previous tom
              fom: "2021-02-01",
              tom: "2021-02-15",
            }),
            createAktivitetIkkeMuligPeriode({
              fom: "2021-02-20",
              tom: "2021-03-15",
            }),
          ],
        }),
      ],
    });

    // 53 days in total
    expect(hasBeenSykmeldt6WeeksWithout16DaysOpphold(sykmeldt)).toBe(true);
  });

  it("should not days when days between period is 17 or more", () => {
    const sykmeldt = createPreviewSykmeldt({
      sykmeldinger: [
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              fom: "2021-01-01",
              tom: "2021-01-15",
            }),
          ],
        }),
        createSykmelding({
          perioder: [
            createAktivitetIkkeMuligPeriode({
              // 17 days between this and previous tom
              fom: "2021-02-02",
              // Would sum to 44 days, but 17 days between previous tom and this fom
              tom: "2021-03-02",
            }),
          ],
        }),
      ],
    });

    expect(hasBeenSykmeldt6WeeksWithout16DaysOpphold(sykmeldt)).toBe(false);
  });
});
