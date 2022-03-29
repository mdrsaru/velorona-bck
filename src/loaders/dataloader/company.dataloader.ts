import { injectable, inject } from 'inversify';

import Dataloader from 'dataloader';

import { TYPES } from '../../types';
import container from '../../inversify.config';
import { ICompanyRepository } from '../../interfaces/company.interface';

const batchCompanyByIdFn = async (ids: readonly string[]) => {
  const companyRepo: ICompanyRepository = container.get(TYPES.CompanyRepository);
  const query = { id: ids };
  const companys = await companyRepo.getAll({ query });

  const companyObj: any = {};

  companys.forEach((company: any) => {
    companyObj[company.id] = company;
  });

  return ids.map((id) => companyObj[id]);
};

export const companyByIdLoader = () => new Dataloader(batchCompanyByIdFn);
