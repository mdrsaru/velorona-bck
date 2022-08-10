import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { IDemoRequestRepository, IDemoRequestService } from '../../interfaces/demo-request.interface';

// DemoRequest
import DemoRequestRepository from '../../repository/demo-request.repository';
import DemoRequestService from '../../services/demo-request.service';

// Resolvers
import { DemoRequestResolver } from '../../graphql/resolvers/demo-request.resolver';

const demoRequest = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IDemoRequestRepository>(TYPES.DemoRequestRepository).to(DemoRequestRepository);
  bind<IDemoRequestService>(TYPES.DemoRequestService).to(DemoRequestService);
  bind<DemoRequestResolver>(DemoRequestResolver).to(DemoRequestResolver).inSingletonScope();
});

export default demoRequest;
