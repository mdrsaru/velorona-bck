import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceIdInSubscriptionPayment1675420810532 implements MigrationInterface {
  name = 'AddInvoiceIdInSubscriptionPayment1675420810532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD "invoice_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ALTER COLUMN "payment_date" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ALTER COLUMN "payment_date"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP COLUMN "invoice_id"
        `);
  }
}
