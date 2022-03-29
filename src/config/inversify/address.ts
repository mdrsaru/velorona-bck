import { ContainerModule, interfaces } from 'inversify';

import { IAddressRepository } from '../../interfaces/address.interface';
import AddressRepository from '../../repository/address.repository';
import { TYPES } from '../../types';

const address = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IAddressRepository>(TYPES.AddressRepository).to(AddressRepository);
});

export default address;
