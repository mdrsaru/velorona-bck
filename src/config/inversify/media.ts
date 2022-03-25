import { ContainerModule, interfaces } from 'inversify';
import MediaController from '../../controllers/media.controller';
import {
  IMediaRepository,
  IMediaService,
} from '../../interfaces/media.interface';
import MediaRepository from '../../repository/media.repository';
import MediaService from '../../services/media.service';

import { TYPES } from '../../types';

const media = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IMediaRepository>(TYPES.MediaRepository).to(MediaRepository);
    bind<IMediaService>(TYPES.MediaService).to(MediaService);
    bind<MediaController>(TYPES.MediaController).to(MediaController);
  }
);

export default media;
