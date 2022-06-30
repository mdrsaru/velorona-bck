import Address from '../entities/address.entity';

export interface IAddress {
  id: string;
  streetAddress: string;
  aptOrSuite: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface IAddressInput {
  country: string;
  streetAddress: string;
  aptOrSuite?: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface IAddressCreateInput extends IAddressInput {}

export interface IAddressUpdateInput extends IAddressInput {
  id?: string;
}

export interface IAddressRepository {
  getAll(args: any): Promise<Address[]>;
}
