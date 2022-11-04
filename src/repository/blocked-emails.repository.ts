import { injectable } from 'inversify';
import { getManager, EntityManager, getRepository, Repository } from 'typeorm';

import { entities } from '../config/constants';
import BaseRepository from './base.repository';
import BlockedEmails from '../entities/blocked-emails.entity';
import { IBlockedEmailsRepository } from '../interfaces/common.interface';

import * as apiError from '../utils/api-error';

@injectable()
export default class BlockedEmailsRepository implements IBlockedEmailsRepository {
  private manager: EntityManager;
  private repo: Repository<BlockedEmails>;

  constructor() {
    this.repo = getRepository(BlockedEmails);
    this.manager = getManager();
  }

  create = async (args: { emails: string[] }) => {
    try {
      const emails = args.emails;

      if (!emails?.length) {
        throw new apiError.ValidationError({
          details: ['Emails required'],
        });
      }

      let values: any = emails.map((email) => ({ email }));

      let result = await this.repo
        .createQueryBuilder(entities.blockedEmails)
        .insert()
        .values(values)
        .onConflict('(email) DO NOTHING')
        .execute();

      return result;
    } catch (err) {
      throw err;
    }
  };

  removeMany = async (args: { emails: string[] }) => {
    try {
      const emails = args.emails;

      if (!emails?.length) {
        throw new apiError.ValidationError({
          details: ['Emails required'],
        });
      }

      let values: string[] = emails.map((_, index) => `$${index + 1}`);

      const result = await this.manager.query(
        `DELETE FROM blocked_emails WHERE emails in (${values.join(',')});`,
        emails
      );

      return result;
    } catch (err) {
      throw err;
    }
  };
}
