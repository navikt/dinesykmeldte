import { describe, expect, it } from "vitest";
import {
  AvbestillPaaminnelseResponseSchema,
  BestillPaaminnelseRequestSchema,
  BestillPaaminnelseResponseSchema,
  HentPaaminnelseStatusResponseSchema,
  PaaminnelseFeilResponseSchema,
} from "./paaminnelseContract";

describe("paaminnelseContract", () => {
  it("parses the supported status variants", () => {
    expect(
      HentPaaminnelseStatusResponseSchema.parse({ status: "SKJULT" }),
    ).toEqual({ status: "SKJULT" });
    expect(
      HentPaaminnelseStatusResponseSchema.parse({
        status: "TILBUD",
        reminderTiming: {
          code: "BEFORE_4_WEEKS",
          textKey: "paaminnelse.beforeFourWeeks",
        },
      }),
    ).toEqual({
      status: "TILBUD",
      reminderTiming: {
        code: "BEFORE_4_WEEKS",
        textKey: "paaminnelse.beforeFourWeeks",
      },
    });
    expect(
      HentPaaminnelseStatusResponseSchema.parse({
        status: "BESTILT",
        reminderTiming: {
          triggerAt: "2026-06-30T10:15:30+02:00",
        },
      }),
    ).toEqual({
      status: "BESTILT",
      reminderTiming: {
        triggerAt: "2026-06-30T10:15:30+02:00",
      },
    });
  });

  it("rejects unknown fields from success responses", () => {
    expect(
      BestillPaaminnelseResponseSchema.safeParse({
        status: "BESTILT",
        reminderTiming: {
          code: "BEFORE_FOUR_WEEKS",
        },
        fnr: "12345678910",
      }).success,
    ).toBe(false);
    expect(
      AvbestillPaaminnelseResponseSchema.safeParse({
        status: "TILBUD",
        orgnummer: "999888777",
      }).success,
    ).toBe(false);
  });

  it("allows an empty bestilling body and rejects extra fields", () => {
    expect(BestillPaaminnelseRequestSchema.parse(undefined)).toBeUndefined();
    expect(BestillPaaminnelseRequestSchema.parse({})).toEqual({});
    expect(
      BestillPaaminnelseRequestSchema.safeParse({
        dagerForFrist: 3,
      }).success,
    ).toBe(false);
  });

  it("rejects unknown or unsafe reminder timing fields", () => {
    expect(
      HentPaaminnelseStatusResponseSchema.safeParse({
        status: "BESTILT",
        reminderTiming: {
          code: "12345678910",
        },
      }).success,
    ).toBe(false);
    expect(
      HentPaaminnelseStatusResponseSchema.safeParse({
        status: "BESTILT",
        reminderTiming: {
          textKey: "999888777",
        },
      }).success,
    ).toBe(false);
    expect(
      HentPaaminnelseStatusResponseSchema.safeParse({
        status: "BESTILT",
        reminderTiming: {
          code: "BEFORE_FOUR_WEEKS",
          narmestelederId: "123",
        },
      }).success,
    ).toBe(false);
    expect(
      HentPaaminnelseStatusResponseSchema.safeParse({
        status: "BESTILT",
        reminderTiming: {},
      }).success,
    ).toBe(false);
  });

  it("only accepts fixed error codes without extra text", () => {
    expect(
      PaaminnelseFeilResponseSchema.parse({
        feilkode: "STATUS_FEILET",
      }),
    ).toEqual({
      feilkode: "STATUS_FEILET",
    });
    expect(
      PaaminnelseFeilResponseSchema.safeParse({
        feilkode: "STATUS_FEILET",
        message: "backend said too much",
      }).success,
    ).toBe(false);
  });
});
