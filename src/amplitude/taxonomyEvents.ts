/**
 * Custom app-specific events beyond the decorator's standard taxonomy.
 *
 * Uses the same { eventName, data } shape as AmplitudeTaxonomyEvents so the full union
 * has a consistent discriminant. Properties are intentionally strict (required) to ensure
 * call-sites always provide required fields and to prevent PII leakage via extra properties.
 *
 * Composed into AmplitudeTaxonomyEvents as the single source of truth for custom events.
 */
export type CustomAnalyticsEvents =
  | { eventName: "komponent vist"; data: { komponent: string } }
  | { eventName: "handling"; data: { navn: string } }
  | { eventName: "video start"; data: { video: string } }
  | { eventName: "video stopp"; data: { video: string } };

/**
 * The app's full event union in { eventName, data } format for internal wrapper calls.
 *
 * Standard events mirror the decorator's AnalyticsEvents taxonomy (event names and properties
 * are identical to https://github.com/navikt/analytics-taxonomy).
 * Custom events are composed from CustomAnalyticsEvents (strict required fields, single source).
 */
export type AmplitudeTaxonomyEvents =
  | { eventName: "accordion lukket"; data: { tekst: string } }
  | { eventName: "accordion åpnet"; data: { tekst: string } }
  | { eventName: "alert vist"; data: { variant: string; tekst: string } }
  | { eventName: "besøk" }
  | { eventName: "chat avsluttet"; data: { komponent: string } }
  | { eventName: "chat startet"; data: { komponent: string } }
  | {
      eventName: "last ned";
      data: { type: string; tema: string; tittel: string };
    }
  | { eventName: "modal lukket"; data: { tekst: string } }
  | { eventName: "modal åpnet"; data: { tekst: string } }
  | { eventName: "navigere"; data: { lenketekst: string; destinasjon: string } }
  | {
      eventName: "skjema fullført";
      data: { skjemanavn: string /* skjemaId: number */ };
    }
  | {
      eventName: "skjema innsending feilet";
      data: { skjemanavn: string /* skjemaId: number */ };
    }
  | {
      eventName: "skjema spørsmål besvart";
      data: {
        skjemanavn: string;
        spørsmål: string;
        svar: string /* skjemaId: number */;
      };
    }
  | {
      eventName: "skjema startet";
      data: { skjemanavn: string /* skjemaId: number */ };
    }
  | {
      eventName: "skjema steg fullført";
      data: { skjemanavn: string; steg: string /* skjemaId: number */ };
    }
  | {
      eventName: "skjema validering feilet";
      data: { skjemanavn: string /* skjemaId: number */ };
    }
  | {
      eventName: "skjema åpnet";
      data: { skjemanavn: string /* skjemaId: number */ };
    }
  | {
      eventName: "guidepanel vist";
      data: { komponent: string; tekst?: string };
    }
  | {
      eventName: "søk";
      data: { destinasjon: string; søkeord: string; komponent?: string };
    }
  // Custom app-specific events — CustomAnalyticsEvents is the single source of truth
  | CustomAnalyticsEvents;
