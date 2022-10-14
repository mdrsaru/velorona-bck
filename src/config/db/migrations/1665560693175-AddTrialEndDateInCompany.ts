import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrialEndDateInCompany1665560693175 implements MigrationInterface {
  name = 'AddTrialEndDateInCompany1665560693175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "trial_end_date" TIMESTAMP WITH TIME ZONE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "trial_end_date"
        `);
  }
}
