import { describe, expect, it } from "vitest";
import type {
  AktivitetIkkeMulig,
  Avventende,
  Behandlingsdager,
  Gradert,
  PreviewFremtidigSoknad,
  PreviewNySoknad,
  PreviewSendtSoknad,
  Reisetilskudd,
} from "../../../graphql/resolvers/resolvers.generated";
import {
  PreviewFremtidigSoknadSchema,
  PreviewNySoknadSchema,
  PrewievSendtSoknadSchema,
} from "./soknad";
import {
  AktivitetIkkeMuligSchema,
  AvventendeSchema,
  BehandlingsdagerSchema,
  GradertSchema,
  ReisetilskuddSchema,
} from "./sykmelding";

describe("mineSykmeldteSchema", () => {
  it("should match typescript types for søknad union", () => {
    const parse = (): void => {
      // This test only provides type errors
      const _fremtidig: PreviewFremtidigSoknad =
        PreviewFremtidigSoknadSchema.parse({});
      const _sendt: PreviewSendtSoknad = PrewievSendtSoknadSchema.parse({});
      const _ny: PreviewNySoknad = PreviewNySoknadSchema.parse({});
    };

    expect(parse).toThrow();
  });

  it("should match typescript types for sykmeldingsperiode union", () => {
    const parse = (): void => {
      // This test only provides type errors
      const _aktivitetIkkeMulig: AktivitetIkkeMulig =
        AktivitetIkkeMuligSchema.parse({});
      const _avventende: Avventende = AvventendeSchema.parse({});
      const _behandlingsdager: Behandlingsdager = BehandlingsdagerSchema.parse(
        {},
      );
      const _gradert: Gradert = GradertSchema.parse({});
      const _reisetilskudd: Reisetilskudd = ReisetilskuddSchema.parse({});
    };

    expect(parse).toThrow();
  });
});
