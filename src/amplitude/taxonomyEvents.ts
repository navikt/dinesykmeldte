// Basert på https://github.com/navikt/analytics-taxonomy
export type AmplitudeTaxonomyEvents =
    | { eventName: 'modal åpnet'; data: { tekst: string } }
    | { eventName: 'modal lukket'; data: { tekst: string } }
    | { eventName: 'søk'; data: { destinasjon: string; søkeord: string; komponent?: string } }
