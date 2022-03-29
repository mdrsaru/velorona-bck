import { define } from 'typeorm-seeding';

import { CompanyStatus } from '../../../config/constants';

import Company from '../../../entities/company.entity';

define(Company, () => {
  const company = new Company();

  return company;
});
