import pino, { Logger } from 'pino';

const getFrontendLogger = (): Logger =>
    pino({
        browser: {
            transmit: {
                send: async (level, logEvent) => {
                    try {
                        await fetch('/api/logger', {
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

const createBackendLogger = (): Logger =>
    pino({
        prettyPrint: process.env.NODE_ENV !== 'production',
        timestamp: false,
        formatters: {
            level: (label) => {
                return { level: label };
            },
        },
    });

export const logger = typeof window !== 'undefined' ? getFrontendLogger() : createBackendLogger();
