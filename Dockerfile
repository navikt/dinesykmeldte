FROM node:16-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY next.config.js /app/
COPY .next/standalone /app/
COPY src/**/**/*.graphqls /app/
COPY public /app/public/

EXPOSE 3000

CMD ["node", "server.js"]
