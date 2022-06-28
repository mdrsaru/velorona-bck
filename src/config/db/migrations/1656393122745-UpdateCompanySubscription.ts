import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanySubscription1656393122745 implements MigrationInterface {
  name = 'UpdateCompanySubscription1656393122745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "stripe_customer_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "plan" character varying DEFAULT 'Starter'
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "subscription_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "subscription_item_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "subscription_status" character varying
        `);
    await queryRunner.query(`
            CREATE INDEX "client_invoicing_email_index" ON "clients" ("invoicingEmail")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."client_invoicing_email_index"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "subscription_status"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "subscription_item_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "subscription_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "plan"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "stripe_customer_id"
        `);
  }
}
