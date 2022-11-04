import { Entity, Column, Index } from 'typeorm';

import { Base } from './base.entity';
import { entities } from '../config/constants';

const name = entities.blockedEmails;

@Entity({ name })
export default class BlockedEmails extends Base {
  @Index(`${name}_email`)
  @Column({ unique: true })
  email: string;
}
