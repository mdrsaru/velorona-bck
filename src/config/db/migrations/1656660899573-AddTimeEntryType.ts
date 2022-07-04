import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeEntryType1656660899573 implements MigrationInterface {
  name = 'AddTimeEntryType1656660899573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "entry_type" character varying NOT NULL DEFAULT 'Timesheet'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "entry_type"
        `);
  }
}
