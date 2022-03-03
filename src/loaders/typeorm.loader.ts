import { connection } from '../config/db/connection-manager';
import { databaseSetting } from '../config/constants';
import { TYPES } from '../types';
import container from '../inversify.config';
import { ILogger } from '../interfaces/common.interface';

const logger = container.get<ILogger>(TYPES.Logger);
logger.init('typeorm.loader');

export default async (): Promise<void> => {
  connection()
    .then(() => {
      logger.info({
        operation: 'connection',
        message: 'Database connected',
      });
    })
    .catch((err) => {
      logger.error({
        operation: 'connection',
        message: err.message,
        data: err,
      });
    });
};
