import winston, { format, Logger, LoggerOptions } from 'winston';
import { injectable } from 'inversify';
import colors from 'colors';
import util from 'util';
import isError from 'lodash/isError';
import 'winston-daily-rotate-file';

import { ILogger, ILoggerInput } from '../interfaces/common.interface';
import constants from '../config/constants';

const { combine, timestamp, label, printf } = format;

interface ILogEntry extends ILoggerInput {
  level: string;
}

const rotateFileOptions = {
  level: constants.log.fileLogLevel,
  dirname: constants.log.dirname,
  filename: `.${constants.appName}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  handleExceptions: true,
  timestamp: true,
  format: format.json(),
};

@injectable()
export default class WinstonLogger implements ILogger {
  private logger: Logger;
  private name: string;

  constructor() {
    let loggerOptions: LoggerOptions = this.getOptions();
    this.logger = winston.createLogger(loggerOptions);
  }

  init(name: string) {
    this.name = name;
  }

  log(args: ILogEntry) {
    let logArgs = {
      ...args,
      name: `${this.name || ''}.${args.operation}()`,
    };

    this.logger.log(logArgs);
  }

  error(args: ILoggerInput): void {
    this.log({
      level: 'error',
      ...args,
    });
  }

  warn(args: ILoggerInput): void {
    this.log({
      level: 'warn',
      ...args,
    });
  }

  info(args: ILoggerInput): void {
    this.log({
      level: 'info',
      ...args,
    });
  }

  verbose(args: ILoggerInput): void {
    this.log({
      level: 'verbose',
      ...args,
    });
  }

  debug(args: ILoggerInput): void {
    this.log({
      level: 'debug',
      ...args,
    });
  }

  silly(args: ILoggerInput): void {
    this.log({
      level: 'silly',
      ...args,
    });
  }

  consoleFormatter() {
    let formatter = printf((info) => {
      return `${colors.grey(info.timestamp)} - ${info.name ? `${colors.magenta(info.name)} - ` : ''}${info.level}: ${
        info.message
      } ${
        info.data
          ? isError(info.data)
            ? `\n${colors.yellow(util.inspect(info.data, false, null, true))}`
            : `\n${colors.magenta(util.format('%o', info.data))}`
          : ''
      }`;
    });

    return combine(label({ label: 'label' }), timestamp(), formatter);
  }

  getOptions = (): LoggerOptions => {
    let options: LoggerOptions = {};
    options.transports = [new winston.transports.Console()];

    if (constants.env !== 'production') {
      options.level = 'debug';
    } else {
      options.level = 'info';
    }

    if (constants.log.fileLogLevel && constants.log.dirname) {
      options.transports.push(
        new winston.transports.DailyRotateFile({
          ...rotateFileOptions,
          level: constants.log.logLevels.error,
          filename: `.${constants.log.errorLogFilename}-%DATE%.log`,
        }),
        new winston.transports.DailyRotateFile(rotateFileOptions)
      );
    }

    options.format = this.consoleFormatter();
    return options;
  };
}
