import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanySubscriptionPeriodEnd1665393798053 implements MigrationInterface {
  name = 'AddCompanySubscriptionPeriodEnd1665393798053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "subscription_period_end" TIMESTAMP WITH TIME ZONE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "subscription_period_end"
        `);
  }
}
