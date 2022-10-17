import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTrialEndedInCompany1665981533799 implements MigrationInterface {
  name = 'RemoveTrialEndedInCompany1665981533799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."companies_trial_ended"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "trial_ended"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "trial_ended" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_trial_ended" ON "companies" ("trial_ended")
        `);
  }
}
