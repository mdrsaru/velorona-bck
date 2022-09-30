import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBiweeklyStartDateColumnName1664521063628 implements MigrationInterface {
  name = 'ChangeBiweeklyStartDateColumnName1664521063628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
                RENAME COLUMN "biweekly_start_date" TO "schedule_start_date"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
                RENAME COLUMN "schedule_start_date" TO "biweekly_start_date"
        `);
  }
}
