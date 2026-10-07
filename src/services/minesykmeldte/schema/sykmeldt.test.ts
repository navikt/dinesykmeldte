import { describe, expect, it } from "vitest";
import { MineSykmeldteApiSchema } from "./sykmeldt";

const sykmeldt = {
  narmestelederId: "test-leder",
  orgnummer: "test-org",
  orgnavn: "Test company",
  fnr: "synthetic-id",
  navn: "Test employee",
  friskmeldt: false,
  sykmeldinger: [],
  previewSoknader: [],
  dialogmoter: [],
  oppfolgingsplaner: [],
};

describe("MineSykmeldteApiSchema", () => {
  it("strips retired or unknown backend fields during a frontend-first rollout", () => {
    const backendResponse = [
      {
        ...sykmeldt,
        retiredBackendField: [{ unexpected: "not validated or retained" }],
      },
    ];

    expect(MineSykmeldteApiSchema.parse(backendResponse)).toEqual([sykmeldt]);
    expect(backendResponse[0]).toHaveProperty("retiredBackendField");
  });

  it("still validates the remaining fields", () => {
    expect(
      MineSykmeldteApiSchema.safeParse([
        { ...sykmeldt, dialogmoter: "invalid" },
      ]).success,
    ).toBe(false);
  });
});
