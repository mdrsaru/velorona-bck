import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceConfigColumnInClient1659287327299 implements MigrationInterface {
  name = 'AddInvoiceConfigColumnInClient1659287327299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "invoice_payment_config_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_d34f36e4131811317bba4cebcc6" FOREIGN KEY ("invoice_payment_config_id") REFERENCES "invoice_payment_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_d34f36e4131811317bba4cebcc6"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "invoice_payment_config_id"
        `);
  }
}
