import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { IAddressRepository } from '../../interfaces/address.interface';

const batchAddressByIdFn = async (ids: readonly string[]) => {
  const addressRepo: IAddressRepository = container.get(TYPES.AddressRepository);
  const query = { id: ids };
  const address = await addressRepo.getAll({ query });
  const addressObj: any = {};

  address.forEach((address: any) => {
    addressObj[address.id] = address;
  });
  return ids.map((id) => addressObj[id]);
};

export const addressByIdLoader = () => new Dataloader(batchAddressByIdFn);
