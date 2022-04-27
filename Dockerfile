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

FROM base AS app_build 
WORKDIR /app
COPY package.json yarn.lock ./
COPY --from=build /app/build ./build/
RUN yarn --production 

FROM app_build AS stage
CMD ["yarn", "stage"]

FROM app_build AS prod 
CMD ["yarn", "production"]
