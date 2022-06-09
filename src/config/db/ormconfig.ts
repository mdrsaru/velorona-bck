import path from 'path';
import { createConnection, Connection } from 'typeorm';

import { databaseSetting } from '../constants';

const connectionConfig = {
  type: databaseSetting.dialect as 'postgres',
  host: databaseSetting.host,
  port: databaseSetting.port,
  username: databaseSetting.username,
  password: databaseSetting.password,
  database: databaseSetting.name,
  synchronize: false,
  logging: databaseSetting.logging,
  entities: [path.join(__dirname, '../..', 'entities/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/**/*.{ts,js}')],
  seeds: [path.join(__dirname, 'seeds/**/*.{ts,js}')],
  factories: [path.join(__dirname, 'factories/**/*.{ts,js}')],
  cli: {
    entitiesDir: path.join(__dirname, '../..', 'entities'),
    migrationsDir: path.join(__dirname, 'migrations'),
  },
};

export = connectionConfig;
