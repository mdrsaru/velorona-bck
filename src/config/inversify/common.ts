import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// Interfaces
import {
  ILogger,
  IErrorService,
  IJoiService,
  IHashService,
  IAppService,
  ITokenService,
  IEmailService,
  ITemplateService,
  IUploadService,
} from '../../interfaces/common.interface';
import { IGraphql } from '../../interfaces/graphql.interface';

// Implementations
import WinstonLogger from '../../utils/winston-logger';
import AppService from '../../services/app.service';
import AppController from '../../controllers/app.controller';
import GraphqlService from '../../services/graphql.service';
import BcryptService from '../../services/bcrypt.service';
import ErrorService from '../../services/error.service';
import JoiService from '../../services/joi.service';
import TokenService from '../../services/jwt.service';
import SendGridService from '../../services/sendgrid.service';
import HandlebarsService from '../../services/handlebars.service';
import WebhookController from '../../controllers/webhook.controller';
import WebhookService from '../../services/webhook.service';
import NodemailerService from '../../services/nodemailer.service';
import AWSController from '../../controllers/aws.controller';
import AWSService from '../../services/aws.service';
import UploadService from '../../services/upload.service';

export const app = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IAppService>(TYPES.AppService).to(AppService);
  bind<AppController>(TYPES.AppController).to(AppController);
});

export const logger = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ILogger>(TYPES.Logger).to(WinstonLogger);
  bind<interfaces.Factory<ILogger>>(TYPES.LoggerFactory).toFactory<ILogger>((context: interfaces.Context) => {
    return (name: string) => {
      let logger = context.container.get<ILogger>(TYPES.Logger);
      logger.init(name);
      return logger;
    };
  });
});

export const graphql = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IGraphql>(TYPES.GraphqlService).to(GraphqlService);
});

export const hash = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IHashService>(TYPES.HashService).to(BcryptService);
});

export const token = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITokenService>(TYPES.TokenService).to(TokenService);
});

export const email = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IEmailService>(TYPES.EmailService).to(SendGridService);
  //bind<IEmailService>(TYPES.EmailService).to(NodemailerService);
});

export const handlebars = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITemplateService>(TYPES.HandlebarsService).to(HandlebarsService);
});

export const error = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IErrorService>(TYPES.ErrorService).to(ErrorService);
});

export const joi = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IJoiService>(TYPES.JoiService).to(JoiService);
});

export const webhook = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<WebhookController>(TYPES.WebhookController).to(WebhookController);
  bind<WebhookService>(TYPES.WebhookService).to(WebhookService);
});

export const aws = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<AWSController>(TYPES.AWSController).to(AWSController);
  bind<AWSService>(TYPES.AWSService).to(AWSService);
});

export const upload = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IUploadService>(TYPES.UploadService).to(UploadService);
});
