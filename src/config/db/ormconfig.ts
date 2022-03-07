import path from 'path';
import { createConnection, Connection, DatabaseType } from 'typeorm';

import { databaseSetting } from '../constants';

const connectionConfig = {
  type: databaseSetting.dialect as 'mysql',
  host: databaseSetting.host,
  port: databaseSetting.port,
  username: databaseSetting.username,
  password: databaseSetting.password,
  database: databaseSetting.name,
  synchronize: databaseSetting.synchronize,
  logging: databaseSetting.logging,
  entities: [path.join(__dirname, '../..', 'entities/**/*.ts')],
  migrations: [path.join(__dirname, 'migrations/**/*.ts')],
  cli: {
    entitiesDir: path.join(__dirname, '../..', 'entities'),
    migrationsDir: path.join(__dirname, 'migrations'),
  },
};

export = connectionConfig;
