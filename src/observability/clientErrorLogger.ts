const CLIENT_LOGGER_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/logger`;

type ClientErrorContext = Readonly<Record<string, string | undefined>>;

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  let message = "Unknown client error";
  try {
    message = String(error);
  } catch {
    // Keep the fallback instead of risking another error while reporting.
  }

  return { type: "UnknownError", message };
};

/**
 * Sends an error to the backend log without also writing it to console.error.
 * Use this only when the framework already owns the browser-side report.
 */
export function sendClientErrorToBackend(
  error: unknown,
  message: string,
  context: ClientErrorContext = {},
): void {
  const body = {
    level: { label: "error", value: 50 },
    ts: Date.now(),
    bindings: [],
    messages: [{ err: serializeError(error), ...context }, message],
  };

  void fetch(CLIENT_LOGGER_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}
