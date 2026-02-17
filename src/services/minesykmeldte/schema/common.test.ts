import { describe, expect, it } from "vitest";
/* eslint-disable @typescript-eslint/no-unused-vars */
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
      const fremtidig: PreviewFremtidigSoknad =
        PreviewFremtidigSoknadSchema.parse({});
      const sendt: PreviewSendtSoknad = PrewievSendtSoknadSchema.parse({});
      const ny: PreviewNySoknad = PreviewNySoknadSchema.parse({});
    };

    expect(parse).toThrow();
  });

  it("should match typescript types for sykmeldingsperiode union", () => {
    const parse = (): void => {
      // This test only provides type errors
      const aktivitetIkkeMulig: AktivitetIkkeMulig =
        AktivitetIkkeMuligSchema.parse({});
      const avventende: Avventende = AvventendeSchema.parse({});
      const behandlingsdager: Behandlingsdager = BehandlingsdagerSchema.parse(
        {},
      );
      const gradert: Gradert = GradertSchema.parse({});
      const reisetilskudd: Reisetilskudd = ReisetilskuddSchema.parse({});
    };

    expect(parse).toThrow();
  });
});
