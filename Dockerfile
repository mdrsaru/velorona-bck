FROM node:14.19.0-alpine AS base

FROM base AS dev 
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
CMD ["yarn", "dev"]

FROM base AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM base AS prod
WORKDIR /app
COPY package.json yarn.lock ./
COPY --from=build /app/build ./
RUN yarn --production 
CMD ["yarn", "start:production"]

