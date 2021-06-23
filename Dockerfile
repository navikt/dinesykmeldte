FROM node:16-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json /app/
COPY scripts /app/scripts

RUN npm ci

COPY .next /app/.next/
COPY public /app/public/
COPY next.config.js /app/
COPY src/**/*.graphqls /app/

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
