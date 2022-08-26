import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceRateInUserPayRateAndHourlyInvoiceRateInTimeEntry1661405380114 implements MigrationInterface {
  name = 'AddInvoiceRateInUserPayRateAndHourlyInvoiceRateInTimeEntry1661405380114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payrate" ADD "invoice_rate" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(
      `ALTER TABLE "time_entries" ADD "hourly_invoice_rate" double precision NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE "user_payrate" ALTER COLUMN "amount" SET DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payrate" ALTER COLUMN "amount" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "time_entries" DROP COLUMN "hourly_invoice_rate"`);
    await queryRunner.query(`ALTER TABLE "user_payrate" DROP COLUMN "invoice_rate"`);
  }
}
