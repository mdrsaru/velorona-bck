import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceLinkandReceiptLinkInSubscriptionPayment1674028034011 implements MigrationInterface {
  name = 'AddInvoiceLinkandReceiptLinkInSubscriptionPayment1674028034011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD "invoice_link" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD "receipt_link" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP COLUMN "receipt_link"
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP COLUMN "invoice_link"
        `);
  }
}
