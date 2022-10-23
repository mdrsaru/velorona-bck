import { buildSchema } from 'type-graphql';

import container from '../inversify.config';
import { AuthResolver } from './resolvers/auth.resolver';
import { CompanyResolver } from './resolvers/company.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { TaskResolver } from './resolvers/task.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { WorkscheduleResolver } from './resolvers/workschedule.resolver';
import { TimeEntryResolver } from './resolvers/time-entry.resolver';
import { UserClientResolver } from './resolvers/user-client.resolver';
import { ClientResolver } from './resolvers/client.resolver';
import { InvoiceResolver } from './resolvers/invoice.resolver';
import { InvoiceItemResolver } from './resolvers/invoice-item.resolver';
import { UserPayRateResolver } from './resolvers/user-payrate.resolver';
import { TimesheetResolver } from './resolvers/timesheet.resolver';
import { ActivityLogResolver } from './resolvers/activity-log';
import { SubscriptionResolver } from './resolvers/subscription.resolver';
import { AttachedTimesheetResolver } from './resolvers/attached-timesheet';
import { WorkscheduleDetailResolver } from './resolvers/workschedule-details.resolver';
import { WorkscheduleTimeDetailResolver } from './resolvers/workschedule-time-detail.resolver';
import { SubscriptionPaymentResolver } from './resolvers/subscription-payment.resolver';
import { TimesheetCommentResolver } from './resolvers/timesheet-comment.resolver';
import { InvoicePaymentConfigResolver } from './resolvers/invoice-payment-config.resolver';
import { DemoRequestResolver } from './resolvers/demo-request.resolver';
import { CurrencyResolver } from './resolvers/currency';
import { ContactUsResolver } from './resolvers/contact-us.resolver';

export default buildSchema({
  container,
  validate: false,
  // prettier-ignore
  resolvers: [
    CompanyResolver,
    RoleResolver,
    UserResolver,
    AuthResolver,
    TaskResolver,
    ProjectResolver,
    WorkscheduleResolver,
    TimeEntryResolver,
    UserClientResolver,
    ClientResolver,
    UserPayRateResolver,
    InvoiceResolver,
    InvoiceItemResolver,
    TimesheetResolver,
    ActivityLogResolver,
    SubscriptionResolver,
    AttachedTimesheetResolver,
    WorkscheduleDetailResolver,
    WorkscheduleTimeDetailResolver,
    SubscriptionPaymentResolver,
    TimesheetCommentResolver,
    InvoicePaymentConfigResolver,
    DemoRequestResolver,
    CurrencyResolver,
    ContactUsResolver,
  ],
});
