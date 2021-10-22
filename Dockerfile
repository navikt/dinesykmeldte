FROM node:16-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json /app/
COPY .yarn /app/.yarn
COPY .yarnrc.yml /app/
COPY yarn.lock /app/

RUN yarn --immutable

COPY next.config.js /app/
COPY src/**/**/*.graphqls /app/
COPY .next /app/.next/
COPY public /app/public/

EXPOSE 3000
CMD ["yarn", "start:prod"]
