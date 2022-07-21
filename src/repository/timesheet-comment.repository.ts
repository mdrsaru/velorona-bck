import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { injectable, inject } from 'inversify';
import { getRepository, Repository, In, ILike, FindConditions, IsNull, getManager, EntityManager } from 'typeorm';

import { TYPES } from '../types';
import strings from '../config/strings';
import TimesheetComment from '../entities/timesheet-comment.entity';
import BaseRepository from './base.repository';
import * as apiError from '../utils/api-error';

import { ICompanyRepository } from '../interfaces/company.interface';
import { IGetAllAndCountResult, IGetOptions } from '../interfaces/paging.interface';
import {
  ITimesheetComment,
  ITimesheetCommentCreateInput,
  ITimesheetCommentUpdateInput,
  ITimesheetCommentRepository,
  ITimesheetCommentReplyCount,
} from '../interfaces/timesheet-comment.interface';

@injectable()
export default class TimesheetCommentRepository
  extends BaseRepository<TimesheetComment>
  implements ITimesheetCommentRepository
{
  private manager: EntityManager;
  private companyRepository: ICompanyRepository;

  constructor(@inject(TYPES.CompanyRepository) _companyRepository: ICompanyRepository) {
    super(getRepository(TimesheetComment));
    this.manager = getManager();
    this.companyRepository = _companyRepository;
  }

  getAllAndCount = async (args: IGetOptions): Promise<IGetAllAndCountResult<TimesheetComment>> => {
    try {
      let { query = {}, select = [], ...rest } = args;

      const _select = select as (keyof TimesheetComment)[];

      // For array values to be used as In operator
      // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
      for (let key in query) {
        if (isArray(query[key])) {
          query[key] = In(query[key]);
        }
      }

      if (query.parent) {
        query.reply_id = IsNull();
        delete query.parent;
      }

      const [rows, count] = await this.repo.findAndCount({
        where: query,
        ...(_select?.length && { select: _select }),
        ...rest,
      });
      return {
        count,
        rows,
      };
    } catch (err) {
      throw err;
    }
  };

  create = async (args: ITimesheetCommentCreateInput): Promise<TimesheetComment> => {
    try {
      const comment = args.comment;
      const timesheet_id = args.timesheet_id;
      const user_id = args.user_id;
      const reply_id = args.reply_id;

      if (reply_id) {
        const found = await this.getById({
          id: reply_id,
          select: ['id'],
        });

        if (!found) {
          throw new apiError.NotFoundError({
            details: ['Parent comment not found'],
          });
        }
      }

      const timesheetComment = await this.repo.save({
        comment,
        user_id,
        timesheet_id,
        reply_id,
      });

      return timesheetComment;
    } catch (err) {
      throw err;
    }
  };

  update = async (args: ITimesheetCommentUpdateInput): Promise<TimesheetComment> => {
    try {
      const id = args.id;
      const comment = args.comment;

      const errors: string[] = [];

      if (isNil(id) && !isString(id)) {
        errors.push(strings.idRequired);
      }

      if (errors.length) {
        throw new apiError.ValidationError({
          details: errors,
        });
      }

      const found = await this.getById({ id, select: ['id'] });

      if (!found) {
        throw new apiError.NotFoundError({
          details: ['Comment not found'],
        });
      }

      const update: TimesheetComment = merge(found, {
        id,
        comment,
      });

      const timesheetComment = await this.repo.save(update);

      return timesheetComment;
    } catch (err) {
      throw err;
    }
  };

  countReplies = async (ids: string[]): Promise<ITimesheetCommentReplyCount[]> => {
    try {
      const repliesCount = await this.manager.query(
        `
          SELECT reply_id, COUNT(*) FROM timesheet_comments
          WHERE reply_id = ANY($1)
          GROUP BY reply_id;
        `,
        [ids]
      );

      return repliesCount;
    } catch (err) {
      throw err;
    }
  };
}
