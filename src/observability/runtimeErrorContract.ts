/**
 * Closed, code-owned catalog of low-cardinality runtime error outcomes.
 *
 * Domain terms stay Norwegian, while technical outcome suffixes use the
 * shared runtime-error vocabulary.
 */
export const RuntimeErrorEvent = {
  TILTAKSPAKKEVURDERING_LOOKUP_FAILED: "tiltakspakkevurdering_lookup_failed",
} as const;

export type RuntimeErrorEvent =
  (typeof RuntimeErrorEvent)[keyof typeof RuntimeErrorEvent];

export const RuntimeErrorOperation = {
  TILTAKSPAKKEVURDERING_LOOKUP: "tiltakspakkevurdering_lookup",
} as const;

export type RuntimeErrorOperation =
  (typeof RuntimeErrorOperation)[keyof typeof RuntimeErrorOperation];

export const RuntimeErrorCode = {
  AUTORISERTE_ORGNUMRE_LOOKUP_FAILED: "AUTORISERTE_ORGNUMRE_LOOKUP_FAILED",
  FLAGGSKIPET_LOOKUP_FAILED: "FLAGGSKIPET_LOOKUP_FAILED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

export type RuntimeErrorCode =
  (typeof RuntimeErrorCode)[keyof typeof RuntimeErrorCode];

const runtimeErrorOperationByEvent = {
  [RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED]:
    RuntimeErrorOperation.TILTAKSPAKKEVURDERING_LOOKUP,
} satisfies Record<RuntimeErrorEvent, RuntimeErrorOperation>;

export const runtimeErrorCodesByEvent = {
  [RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED]: [
    RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED,
    RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED,
    RuntimeErrorCode.UNEXPECTED_ERROR,
  ],
} as const satisfies Record<RuntimeErrorEvent, readonly RuntimeErrorCode[]>;

type RuntimeErrorCodeForEvent<Event extends RuntimeErrorEvent> =
  (typeof runtimeErrorCodesByEvent)[Event][number];

export function getRuntimeErrorOperation(
  eventType: RuntimeErrorEvent,
): RuntimeErrorOperation {
  return runtimeErrorOperationByEvent[eventType];
}

export function runtimeErrorContext<Event extends RuntimeErrorEvent>(
  eventType: Event,
  errorCode: RuntimeErrorCodeForEvent<Event>,
) {
  return {
    event_type: eventType,
    operation: runtimeErrorOperationByEvent[eventType],
    error_code: errorCode,
  } as const;
}
