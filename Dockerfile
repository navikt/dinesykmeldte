FROM gcr.io/distroless/nodejs22-debian12@sha256:0a118b99c3ef038526f4217f6dac2fc922b37b98be1c113fff10f496a0648213

WORKDIR /app

COPY package.json /app/
COPY next-logger.config.js /app/
COPY src/**/**/*.graphqls /app/
COPY .next/standalone /app/
COPY public /app/public/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
