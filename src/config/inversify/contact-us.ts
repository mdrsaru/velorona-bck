import { ContainerModule, interfaces } from 'inversify';
import { ContactUsResolver } from '../../graphql/resolvers/contact-us.resolver';

const contactUs = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ContactUsResolver>(ContactUsResolver).to(ContactUsResolver).inSingletonScope();
});

export default contactUs;
