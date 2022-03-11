export interface IAddress {
  id: string;
  streetAddress: string;
  aptOrSuite: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface IAddressCreateInput {
  streetAddress: string;
  aptOrSuite?: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface IAddressUpdateInput {
  id?: string;
  streetAddress?: string;
  aptOrSuite?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}
