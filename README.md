#Vellorum API

> Node.js, TypeScript, GraphQL, Express, TypeORM, IoC, SOLID, Jest, Postgresql.

API uses `inversify` as IoC container. More details: https://www.npmjs.com/package/inversify

## Installation guide

```
# clone repository

# install dependencies
$ yarn

# copy and modify the .env.example to .env.{NODE_ENV} or .env

# start
$ yarn dev
```

### `yarn test`

Runs the test cases from the folder `src/tests`

### `npm run build`

Builds the app for production to the `build` folder.

## Using Docker

Make sure docker and docker-compose is installed in your system

```
$ docker-compose up

```

Specifying env file:

```
$ docker-compose --env-file [path-to-env-file] up
```

## Other available scripts

#### `npm run prettier:fix`

Runs prettier on the `.ts` files under `src` folder.

#### `npm run lint:check`

Checks for any error/bugs.

#### `npm run lint:fix`

Runs lint.

#### `yarn typeorm`

Cli for typeorm. Usage `yarn typeorm migration:create -n modify-user-firstname`

#### `yarn start:build`

Runs build server.

### Style guide.

- Tab width: 2
- Trailing comma
- Single quote for the string
