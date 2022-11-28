import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePendingStatusToOpenAndAddPendingUnapprovedFieldInCompany1669618146811 implements MigrationInterface {
  name = 'ChangePendingStatusToOpenAndAddPendingUnapprovedFieldInCompany1669618146811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "unapproved_notification" boolean DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ALTER COLUMN "status"
            SET DEFAULT 'Open'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "unapproved_notification"
        `);
  }
}
