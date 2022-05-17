import { createConnection, Connection, ConnectionOptions } from 'typeorm';

import connectionConfig from '../../config/db/ormconfig';

export const connection = (dropSchema: boolean = false): Promise<Connection> => {
  const connectionOptions: ConnectionOptions = {
    ...connectionConfig,
    dropSchema,
    synchronize: true,
  };

  return createConnection(connectionOptions);
};
