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

### `yarn docs`

Run migration

### `yarn typeorm migration:run`

Run migration from build

### `yarn typeorm:js migration:run`

Generate migration(Make sure you run migration before generating a new migration)

### `yarn typeorm migration:generate -n ${MigrationClassName} -p`

## Using Docker

Make sure docker and docker-compose is installed in your system

```
$ docker-compose up
```

Specifying env file:

```
$ docker-compose [--env-file path-to-env-file] [-f <path-to-docker-compose>] up
```

Run migration

```
$ docker-compose exec app yarn typeorm migration:run
```

### Run tests

```
Copy and update the .env.example with .env.test

# Run postgres container for test database
$ docker-compose --env-file .env.test -f docker-compose.test.yml up -d

# Run the test
$ yarn test [--watchAll]
```

To seed the database, first get the app container id: `docker ps`, then run:
`$ docker exec 'container_id' yarn db:seed`
or
`$ docker-compose exec app yarn db:seed`

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
