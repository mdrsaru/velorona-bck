import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeriodStartDateandPeriodEndDateInSubscriptionPayment1674803653438 implements MigrationInterface {
  name = 'AddPeriodStartDateandPeriodEndDateInSubscriptionPayment1674803653438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD "period_start_date" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD "period_end_date" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP COLUMN "period_end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP COLUMN "period_start_date"
        `);
  }
}
