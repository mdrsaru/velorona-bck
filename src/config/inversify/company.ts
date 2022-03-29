import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { ICompanyRepository, ICompanyService } from '../../interfaces/company.interface';

// Company
import CompanyRepository from '../../repository/company.repository';
import CompanyService from '../../services/company.service';

// Resolvers
import { CompanyResolver } from '../../graphql/resolvers/company.resolver';

const company = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ICompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository);
  bind<ICompanyService>(TYPES.CompanyService).to(CompanyService);
  bind<CompanyResolver>(CompanyResolver).to(CompanyResolver).inSingletonScope();
});

export default company;
