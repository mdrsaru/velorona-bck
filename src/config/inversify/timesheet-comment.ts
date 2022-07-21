import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../../types';

// interface
import { ITimesheetCommentRepository, ITimesheetCommentService } from '../../interfaces/timesheet-comment.interface';

// TimesheetComment
import TimesheetCommentRepository from '../../repository/timesheet-comment.repository';
import TimesheetCommentService from '../../services/timesheet-comment.service';

// Resolvers
import { TimesheetCommentResolver } from '../../graphql/resolvers/timesheet-comment.resolver';

const timesheetComment = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITimesheetCommentRepository>(TYPES.TimesheetCommentRepository).to(TimesheetCommentRepository);
  bind<ITimesheetCommentService>(TYPES.TimesheetCommentService).to(TimesheetCommentService);
  bind<TimesheetCommentResolver>(TimesheetCommentResolver).to(TimesheetCommentResolver).inSingletonScope();
});

export default timesheetComment;
