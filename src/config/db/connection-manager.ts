import path from 'path';
import { createConnection, Connection, DatabaseType } from 'typeorm';

import connectionConfig from './ormconfig';

export const connection = (): Promise<Connection> => {
  return createConnection(connectionConfig);
};
