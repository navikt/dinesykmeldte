import pino from 'pino';

const getFrontendLogger = (): pino.Logger =>
    pino({
        browser: {
            transmit: {
                send: async (level, logEvent) => {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/logger`, {
                            method: 'POST',
                            headers: { 'content-type': 'application/json' },
                            body: JSON.stringify(logEvent),
                        });
                    } catch (e) {
                        console.warn(e);
                        console.warn('Unable to log to backend', logEvent);
                    }
                },
            },
        },
    });

const createBackendLogger = (): pino.Logger =>
    pino({
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        timestamp: false,
        formatters: {
            level: (label) => {
                return { level: label };
            },
        },
    });

export const logger = typeof window !== 'undefined' ? getFrontendLogger() : createBackendLogger();
