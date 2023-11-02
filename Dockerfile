FROM gcr.io/distroless/nodejs20-debian11@sha256:1e7f6128807e21146eca06c37fc58a3944d7864bf9e3b48d0a0b0063fc72b15e

WORKDIR /app

COPY package.json /app/
COPY next-logger.config.js /app/
COPY src/**/**/*.graphqls /app/
COPY .next/standalone /app/
COPY public /app/public/

EXPOSE 3000

ENV NODE_ENV=production
ENV NODE_OPTIONS '-r next-logger'

CMD ["server.js"]
